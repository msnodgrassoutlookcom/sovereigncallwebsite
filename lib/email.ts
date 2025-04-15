import nodemailer from "nodemailer"
import { serverEnv } from "./env"

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: serverEnv.emailServerHost,
    port: serverEnv.emailServerPort,
    secure: serverEnv.emailServerSecure,
    auth: {
      user: serverEnv.emailServerUser,
      pass: serverEnv.emailServerPassword,
    },
  })
}

// Send verification email
export async function sendVerificationEmail(to: string, token: string, username: string) {
  try {
    const verificationUrl = `${serverEnv.appUrl}/verify-email?token=${token}`

    const transporter = createTransporter()

    const mailOptions = {
      from: `"Sovereign's Call" <${serverEnv.emailFrom}>`,
      to,
      subject: "Verify your email for Sovereign's Call",
      text: `Hello ${username},\n\nWelcome to Sovereign's Call! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.\n\nRegards,\nThe Sovereign's Call Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${serverEnv.appUrl}/logo.png" alt="Sovereign's Call Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
          <p>Hello ${username},</p>
          <p>Welcome to Sovereign's Call! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Regards,<br>The Sovereign's Call Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sovereign's Call. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending verification email:", error)
    return false
  }
}

// Send welcome email
export async function sendWelcomeEmail(to: string, username: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Sovereign's Call" <${serverEnv.emailFrom}>`,
      to,
      subject: "Welcome to Sovereign's Call!",
      text: `Hello ${username},\n\nThank you for joining Sovereign's Call! Your account has been successfully created and verified.\n\nYou can now log in and start your journey in the world of Sovereign's Call.\n\nRegards,\nThe Sovereign's Call Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${serverEnv.appUrl}/logo.png" alt="Sovereign's Call Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Welcome to Sovereign's Call!</h2>
          <p>Hello ${username},</p>
          <p>Thank you for joining Sovereign's Call! Your account has been successfully created and verified.</p>
          <p>You can now log in and start your journey in the world of Sovereign's Call.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${serverEnv.appUrl}/login" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Log In Now</a>
          </div>
          <p>Regards,<br>The Sovereign's Call Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sovereign's Call. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return false
  }
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, token: string, username: string) {
  try {
    const resetUrl = `${serverEnv.appUrl}/reset-password?token=${token}`

    const transporter = createTransporter()

    const mailOptions = {
      from: `"Sovereign's Call" <${serverEnv.emailFrom}>`,
      to,
      subject: "Reset your password for Sovereign's Call",
      text: `Hello ${username},\n\nYou requested to reset your password. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nThe Sovereign's Call Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${serverEnv.appUrl}/logo.png" alt="Sovereign's Call Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p>Hello ${username},</p>
          <p>You requested to reset your password. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Regards,<br>The Sovereign's Call Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sovereign's Call. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return false
  }
}

// Send username reminder email
export async function sendUsernameReminderEmail(to: string, username: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Sovereign's Call" <${serverEnv.emailFrom}>`,
      to,
      subject: "Your username for Sovereign's Call",
      text: `Hello,\n\nYou requested a reminder of your username for Sovereign's Call. Your username is: ${username}\n\nYou can now log in to your account.\n\nRegards,\nThe Sovereign's Call Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${serverEnv.appUrl}/logo.png" alt="Sovereign's Call Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Your Username</h2>
          <p>Hello,</p>
          <p>You requested a reminder of your username for Sovereign's Call.</p>
          <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
            <p style="font-size: 18px; font-weight: bold; margin: 0;">Your username is: ${username}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${serverEnv.appUrl}/login" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Log In Now</a>
          </div>
          <p>Regards,<br>The Sovereign's Call Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sovereign's Call. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending username reminder email:", error)
    return false
  }
}

// Send character creation confirmation email
export async function sendCharacterCreationEmail(to: string, username: string, character: any) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Sovereign's Call" <${serverEnv.emailFrom}>`,
      to,
      subject: "New Character Created - Sovereign's Call",
      text: `Hello ${username},\n\nYou have successfully created a new character in Sovereign's Call!\n\nCharacter Details:\nName: ${character.name}\nFaction: ${character.faction || "None"}\nGender: ${character.gender || "None"}\nCombat Class: ${character.combatClass || "None"}\nStory Class: ${character.storyClass || "None"}\n\nYou can now play with your new character in the world of Sovereign's Call.\n\nRegards,\nThe Sovereign's Call Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${serverEnv.appUrl}/logo.png" alt="Sovereign's Call Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Character Created!</h2>
          <p>Hello ${username},</p>
          <p>You have successfully created a new character in Sovereign's Call!</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Character Details:</h3>
            <p><strong>Name:</strong> ${character.name}</p>
            <p><strong>Faction:</strong> ${character.faction || "None"}</p>
            <p><strong>Gender:</strong> ${character.gender || "None"}</p>
            <p><strong>Combat Class:</strong> ${character.combatClass || "None"}</p>
            <p><strong>Story Class:</strong> ${character.storyClass || "None"}</p>
          </div>
          <p>You can now play with your new character in the world of Sovereign's Call.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${serverEnv.appUrl}/characters" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Your Characters</a>
          </div>
          <p>Regards,<br>The Sovereign's Call Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sovereign's Call. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending character creation email:", error)
    return false
  }
}

// Add the missing function for username recovery
export async function sendUsernameRecoveryEmail(to: string, username: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Sovereign's Call" <${serverEnv.emailFrom}>`,
      to,
      subject: "Username Recovery - Sovereign's Call",
      text: `Hello,\n\nYou requested to recover your username for Sovereign's Call. Your username is: ${username}\n\nYou can now log in to your account.\n\nRegards,\nThe Sovereign's Call Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${serverEnv.appUrl}/logo.png" alt="Sovereign's Call Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Username Recovery</h2>
          <p>Hello,</p>
          <p>You requested to recover your username for Sovereign's Call.</p>
          <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
            <p style="font-size: 18px; font-weight: bold; margin: 0;">Your username is: ${username}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${serverEnv.appUrl}/login" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Log In Now</a>
          </div>
          <p>Regards,<br>The Sovereign's Call Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sovereign's Call. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending username recovery email:", error)
    return false
  }
}
