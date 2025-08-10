import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ResumeRequestEmailProps {
  veteranName: string
  pitchTitle: string
  recruiterMessage?: string
  approveUrl: string
  declineUrl: string
}

export default function ResumeRequestEmail({
  veteranName,
  pitchTitle,
  recruiterMessage,
  approveUrl,
  declineUrl,
}: ResumeRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Resume Request for your pitch: {pitchTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Resume Request</Heading>
          
          <Text style={text}>
            Dear {veteranName},
          </Text>
          
          <Text style={text}>
            A recruiter has requested your resume for your pitch: <strong>{pitchTitle}</strong>
          </Text>
          
          {recruiterMessage && (
            <Section style={messageBox}>
              <Text style={messageText}>
                <strong>Recruiter's Message:</strong>
              </Text>
              <Text style={messageText}>
                "{recruiterMessage}"
              </Text>
            </Section>
          )}
          
          <Text style={text}>
            Please click one of the buttons below to approve or decline this request:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={approveButton} href={approveUrl}>
              Approve & Send Resume
            </Button>
            <Button style={declineButton} href={declineUrl}>
              Decline Request
            </Button>
          </Section>
          
          <Text style={footer}>
            This request was made through Xainik. If you have any questions, please contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const messageBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
}

const messageText = {
  color: '#495057',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const approveButton = {
  backgroundColor: '#28a745',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px',
}

const declineButton = {
  backgroundColor: '#dc3545',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
