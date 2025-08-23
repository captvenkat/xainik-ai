// Email Queue System to prevent overwhelming the Resend API
// This ensures emails are sent at a controlled rate

interface QueuedEmail {
  id: string
  template: any
  priority: 'high' | 'normal' | 'low'
  createdAt: Date
  retryCount: number
}

class EmailQueue {
  private queue: QueuedEmail[] = []
  private processing = false
  private maxConcurrent = 2 // Max 2 emails per second (Resend limit)
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startProcessing()
  }

  // Add email to queue
  async addToQueue(template: any, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<string> {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const queuedEmail: QueuedEmail = {
      id,
      template,
      priority,
      createdAt: new Date(),
      retryCount: 0
    }

    // Insert based on priority
    if (priority === 'high') {
      this.queue.unshift(queuedEmail)
    } else if (priority === 'low') {
      this.queue.push(queuedEmail)
    } else {
      // Normal priority - insert after high priority emails
      const highPriorityCount = this.queue.filter(e => e.priority === 'high').length
      this.queue.splice(highPriorityCount, 0, queuedEmail)
    }

    console.log(`Email queued: ${id} (priority: ${priority}, queue length: ${this.queue.length})`)
    return id
  }

  // Start processing queue
  private startProcessing() {
    if (this.processingInterval) return

    this.processingInterval = setInterval(async () => {
      if (this.processing || this.queue.length === 0) return

      this.processing = true
      await this.processNextEmail()
      this.processing = false
    }, 500) // Process every 500ms (2 emails per second)
  }

  // Process next email in queue
  private async processNextEmail() {
    if (this.queue.length === 0) return

    const email = this.queue.shift()
    if (!email) return

    try {
      console.log(`Processing email: ${email.id}`)
      
      // Import Resend dynamically to avoid issues
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const { data, error } = await resend.emails.send(email.template)

      if (error) {
        console.error(`Email failed: ${email.id}`, error)
        
        // Retry logic for failed emails
        if (email.retryCount < 3) {
          email.retryCount++
          email.createdAt = new Date()
          
          // Add back to queue with lower priority
          this.queue.push(email)
          console.log(`Email requeued for retry: ${email.id} (attempt ${email.retryCount})`)
        } else {
          console.error(`Email permanently failed after 3 retries: ${email.id}`)
        }
      } else {
        console.log(`Email sent successfully: ${email.id}`)
      }
    } catch (error) {
      console.error(`Email processing error: ${email.id}`, error)
      
      // Retry logic for errors
      if (email.retryCount < 3) {
        email.retryCount++
        email.createdAt = new Date()
        this.queue.push(email)
        console.log(`Email requeued after error: ${email.id} (attempt ${email.retryCount})`)
      }
    }
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      highPriority: this.queue.filter(e => e.priority === 'high').length,
      normalPriority: this.queue.filter(e => e.priority === 'normal').length,
      lowPriority: this.queue.filter(e => e.priority === 'low').length
    }
  }

  // Clear queue (for testing)
  clearQueue() {
    this.queue = []
    console.log('Email queue cleared')
  }

  // Stop processing
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }
}

// Create singleton instance
export const emailQueue = new EmailQueue()

// Export queue functions
export async function queueEmail(template: any, priority: 'high' | 'normal' | 'low' = 'normal') {
  return emailQueue.addToQueue(template, priority)
}

export function getEmailQueueStatus() {
  return emailQueue.getStatus()
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down email queue...')
  emailQueue.stop()
})

process.on('SIGINT', () => {
  console.log('Shutting down email queue...')
  emailQueue.stop()
})
