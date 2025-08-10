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

interface PlanActivatedEmailProps {
  veteranName: string
  planName: string
  pitchTitle: string
  expiryDate: string
  pitchUrl: string
}

export default function PlanActivatedEmail({
  veteranName,
  planName,
  pitchTitle,
  expiryDate,
  pitchUrl,
}: PlanActivatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your pitch is now live on Xainik!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Your Pitch is Live!</Heading>
          
          <Text style={text}>
            Dear {veteranName},
          </Text>
          
          <Text style={text}>
            Great news! Your pitch "<strong>{pitchTitle}</strong>" is now live and visible to recruiters on Xainik.
          </Text>
          
          <Section style={planBox}>
            <Text style={planText}>
              <strong>Plan Details:</strong>
            </Text>
            <Text style={planText}>
              Plan: {planName}
            </Text>
            <Text style={planText}>
              Expires: {expiryDate}
            </Text>
          </Section>
          
          <Text style={text}>
            Recruiters can now view your pitch, contact you, and request your resume. Your profile will be visible until {expiryDate}.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={pitchUrl}>
              View Your Pitch
            </Button>
          </Section>
          
          <Text style={text}>
            <strong>What's next?</strong>
          </Text>
          
          <Text style={text}>
            • Recruiters will be able to contact you directly<br/>
            • You'll receive notifications when someone views your pitch<br/>
            • You can track your pitch performance in your dashboard<br/>
            • Consider upgrading your plan for extended visibility
          </Text>
          
          <Text style={footer}>
            Thank you for choosing Xainik. We're here to help you succeed in your civilian career transition.
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

const planBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
}

const planText = {
  color: '#495057',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
