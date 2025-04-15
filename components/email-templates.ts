// This file defines email templates used throughout the application.

// Example template: Welcome Email
export const welcomeEmail = (name: string, confirmationLink: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Welcome to Sovereign Call!</title>
    </head>
    <body>
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for signing up for Sovereign Call.</p>
      <p>Please confirm your email address by clicking the link below:</p>
      <p><a href="${confirmationLink}">Confirm Email</a></p>
    </body>
    </html>
  `
}

// Example template: Password Reset Email
export const passwordResetEmail = (name: string, resetLink: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Password Reset Request</title>
    </head>
    <body>
      <h1>Hello, ${name}!</h1>
      <p>You have requested to reset your password for Sovereign Call.</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request a password reset, please ignore this email.</p>
    </body>
    </html>
  `
}

// Example template: Notification Email
export const notificationEmail = (name: string, message: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Notification from Sovereign Call</title>
    </head>
    <body>
      <h1>Hello, ${name}!</h1>
      <p>${message}</p>
    </body>
    </html>
  `
}
