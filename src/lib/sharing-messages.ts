export interface ShareMessageConfig {
  pitchTitle: string
  veteranName: string
  skills?: string[]
  location?: string
  platform: 'whatsapp' | 'linkedin' | 'email' | 'twitter' | 'copy'
  context?: 'referral' | 'general' | 'waitlist'
}

export function generateShareMessage(config: ShareMessageConfig): string {
  const { pitchTitle, veteranName, skills, location, platform, context = 'referral' } = config

  // Base message templates
  const baseMessages = {
    referral: {
      whatsapp: `🎯 Amazing opportunity alert! 

I found this incredible veteran on Xainik who's looking for their next role:

"${pitchTitle}" by ${veteranName}

${skills && skills.length > 0 ? `Skills: ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `Location: ${location}` : ''}

This platform connects military veterans with great opportunities. Check out their pitch and help them find their next mission! 🚀

`,
      linkedin: `🚀 Exciting opportunity to connect with a talented military veteran!

I recently discovered Xainik, a platform dedicated to helping veterans transition to civilian careers. Here's a standout veteran looking for their next role:

**${pitchTitle}** by ${veteranName}

${skills && skills.length > 0 ? `**Key Skills:** ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `**Location:** ${location}` : ''}

Military veterans bring incredible leadership, discipline, and problem-solving skills to any organization. Let's help them find their next mission!

#VeteranHiring #MilitaryTransition #TalentAcquisition #Leadership

`,
      email: `Subject: Amazing Veteran Opportunity - ${pitchTitle}

Hi there,

I wanted to share an incredible opportunity with you. I found this talented military veteran on Xainik who's looking for their next role:

**Pitch:** ${pitchTitle}
**Veteran:** ${veteranName}
${skills && skills.length > 0 ? `**Skills:** ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `**Location:** ${location}` : ''}

Xainik is a platform dedicated to helping veterans transition to civilian careers. This veteran has incredible leadership and problem-solving skills that would be valuable to any organization.

I thought this might be a great opportunity for your network or organization. Military veterans bring unique perspectives and proven leadership abilities that can transform any team.

Best regards,
`,
      twitter: `🎯 Amazing veteran opportunity! 

"${pitchTitle}" by ${veteranName}

${skills && skills.length > 0 ? `Skills: ${skills.slice(0, 3).join(', ')}` : ''}

Military veterans bring incredible leadership & problem-solving skills. Let's help them find their next mission! 🚀

#VeteranHiring #MilitaryTransition`,
      copy: `Check out this veteran's pitch: ${pitchTitle} by ${veteranName}

${skills && skills.length > 0 ? `Skills: ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `Location: ${location}` : ''}

This platform connects military veterans with great opportunities. Help them find their next mission!`
    },
    general: {
      whatsapp: `🎯 I found this amazing veteran on Xainik!

"${pitchTitle}" by ${veteranName}

${skills && skills.length > 0 ? `Skills: ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `Location: ${location}` : ''}

Military veterans bring incredible leadership and problem-solving skills. Check out their pitch! 🚀

`,
      linkedin: `🚀 Connecting with a talented military veteran!

**${pitchTitle}** by ${veteranName}

${skills && skills.length > 0 ? `**Skills:** ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `**Location:** ${location}` : ''}

Military veterans bring unique leadership and problem-solving skills to any organization. Let's help them find their next mission!

#VeteranHiring #MilitaryTransition #Leadership

`,
      email: `Subject: Veteran Opportunity - ${pitchTitle}

Hi,

I wanted to share this veteran's pitch with you:

**${pitchTitle}** by ${veteranName}
${skills && skills.length > 0 ? `**Skills:** ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `**Location:** ${location}` : ''}

Military veterans bring incredible value to organizations. This could be a great opportunity for your network.

Best regards,
`,
      twitter: `🎯 Veteran opportunity: "${pitchTitle}" by ${veteranName}

${skills && skills.length > 0 ? `Skills: ${skills.slice(0, 3).join(', ')}` : ''}

Military veterans bring incredible leadership skills! 🚀

#VeteranHiring`,
      copy: `Check out this veteran's pitch: ${pitchTitle} by ${veteranName}

${skills && skills.length > 0 ? `Skills: ${skills.slice(0, 3).join(', ')}` : ''}
${location ? `Location: ${location}` : ''}

Military veterans bring incredible leadership and problem-solving skills!`
    }
  }

  return baseMessages[context][platform] || baseMessages.general[platform]
}

export function generateWaitlistMessage(position: number, platform: 'whatsapp' | 'linkedin' | 'email' | 'twitter' | 'copy'): string {
  const messages = {
    whatsapp: `🎯 Exclusive Veteran Platform Launch! 

I just joined the waitlist for Xainik - a platform connecting military veterans with amazing opportunities!

🏆 First 50 veterans get FREE access to the complete platform
🎖️ I'm currently #${position} in line
🚀 Help me move up 5 positions by sharing this!

Military veterans deserve the best opportunities. Join the waitlist and help build this community! 🇮🇳

`,
    linkedin: `🚀 Exciting news! I just joined the waitlist for Xainik - a platform dedicated to helping military veterans transition to civilian careers.

**What's special:**
🏆 First 50 veterans get FREE access to the complete platform
🎖️ I'm currently #${position} in line
🚀 Share to move up 5 positions in the queue

Military veterans bring incredible leadership, discipline, and problem-solving skills to any organization. This platform will help connect them with amazing opportunities.

Let's build a stronger community for our veterans! 🇮🇳

#VeteranHiring #MilitaryTransition #VeteranSupport #Leadership

`,
    email: `Subject: Join the Veteran Platform Waitlist - Xainik

Hi there,

I wanted to share some exciting news with you. I just joined the waitlist for Xainik, a platform dedicated to helping military veterans transition to civilian careers.

**What's special:**
• First 50 veterans get FREE access to the complete platform
• I'm currently #${position} in line
• Share to move up 5 positions in the queue

Military veterans bring incredible leadership, discipline, and problem-solving skills to any organization. This platform will help connect them with amazing opportunities.

I thought you might be interested in joining the waitlist too, or sharing it with veterans in your network.

Best regards,
`,
    twitter: `🎯 Exclusive Veteran Platform Launch!

Just joined Xainik waitlist - connecting veterans with opportunities!

🏆 First 50 get FREE access
🎖️ I'm #${position} in line
🚀 Share to move up 5 positions

Military veterans deserve the best! 🇮🇳

#VeteranHiring #MilitaryTransition`,
    copy: `Join the exclusive waitlist for military veterans! First 50 veterans get FREE access to the complete platform. I'm #${position} in line! Share this to move up 5 positions.`
  }

  return messages[platform]
}

export function generatePitchShareUrl(platform: string, message: string, url: string): string {
  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
    case 'email':
      return `mailto:?subject=${encodeURIComponent('Veteran Opportunity')}&body=${encodeURIComponent(message + '\n\n' + url)}`
    case 'copy':
      return url
    default:
      return url
  }
}
