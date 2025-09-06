import { recordFailureAndMaybeAlert, _resetAlertState } from '../src/lib/alert-throttle';

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-email-id' })
    }
  }))
}));

const SPEC = {
  service: 'api',
  route: '/api/posters',
  window: { windowMs: 10*60*1000, maxErrors: 3, cooldownMs: 30*60*1000 },
  emailTo: 'ops@example.com',
};

describe('alert throttle', () => {
  beforeEach(() => { 
    _resetAlertState(); 
    (process as any).env.RESEND_API_KEY='test'; 
    (process as any).env.ADMIN_ALERTS_EMAIL='ops@example.com'; 
  });

  it('does not alert before threshold', async () => {
    const r1 = await recordFailureAndMaybeAlert(SPEC, 'err1'); 
    expect(r1.alerted).toBe(false);
    const r2 = await recordFailureAndMaybeAlert(SPEC, 'err2'); 
    expect(r2.alerted).toBe(false);
  });

  it('alerts at threshold then cools down', async () => {
    const r1 = await recordFailureAndMaybeAlert(SPEC, 'err1'); // 1
    const r2 = await recordFailureAndMaybeAlert(SPEC, 'err2'); // 2
    const r3 = await recordFailureAndMaybeAlert(SPEC, 'err3'); // 3 -> alert
    expect([r1.alerted, r2.alerted].includes(true)).toBe(false);
    expect(r3.alerted).toBe(true);
    const r4 = await recordFailureAndMaybeAlert(SPEC, 'err4'); // within cooldown
    expect(r4.alerted).toBe(false);
  });

  it('skips alert when env missing', async () => {
    // First trigger threshold
    await recordFailureAndMaybeAlert(SPEC, 'err1');
    await recordFailureAndMaybeAlert(SPEC, 'err2');
    
    // Now delete env and trigger alert
    delete (process as any).env.RESEND_API_KEY;
    const r = await recordFailureAndMaybeAlert(SPEC, 'err3'); 
    expect(r.alerted).toBe(false);
    expect(r.reason).toBe('missing_env');
  });

  it('tracks error counts correctly', async () => {
    const r1 = await recordFailureAndMaybeAlert(SPEC, 'err1');
    expect(r1.count).toBe(1);
    const r2 = await recordFailureAndMaybeAlert(SPEC, 'err2');
    expect(r2.count).toBe(2);
  });
});
