import type { SavedCharacter } from "./types"

// Base HTML template with consistent styling
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Sovereign's Call</title>
  <style>
    @media only screen and (max-width: 620px) {
      table.body h1 {
        font-size: 28px !important;
        margin-bottom: 10px !important;
      }
      
      table.body p,
      table.body ul,
      table.body ol,
      table.body td,
      table.body span,
      table.body a {
        font-size: 16px !important;
      }
      
      table.body .wrapper,
      table.body .article {
        padding: 10px !important;
      }
      
      table.body .content {
        padding: 0 !important;
      }
      
      table.body .container {
        padding: 0 !important;
        width: 100% !important;
      }
      
      table.body .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      
      table.body .btn table {
        width: 100% !important;
      }
      
      table.body .btn a {
        width: 100% !important;
      }
      
      table.body .img-responsive {
        height: auto !important;
        max-width: 100% !important;
        width: auto !important;
      }
    }
    
    @media all {
      .ExternalClass {
        width: 100%;
      }
      
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
      
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      
      .btn-primary table td:hover {
        background-color: #8a63d2 !important;
      }
      
      .btn-primary a:hover {
        background-color: #8a63d2 !important;
        border-color: #8a63d2 !important;
      }
    }
  </style>
</head>
<body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
  <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Sovereign's Call - ${content.substring(0, 50)}...</span>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
    <tr>
      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
      <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
        <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
          <!-- START CENTERED WHITE CONTAINER -->
          <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
            <!-- START MAIN CONTENT AREA -->
            <tr>
              <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                  <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="Sovereign's Call" style="max-width: 200px; height: auto;">
                      </div>
                      ${content}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- END MAIN CONTENT AREA -->
          </table>
          <!-- END CENTERED WHITE CONTAINER -->
          
          <!-- START FOOTER -->
          <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
              <tr>
                <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                  <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Sovereign's Call</span>
                  <br> Don't like these emails? <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/email-preferences" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">Unsubscribe</a>.
                </td>
              </tr>
              <tr>
                <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                  © ${new Date().getFullYear()} Sovereign's Call. All rights reserved.
                </td>
              </tr>
            </table>
          </div>
          <!-- END FOOTER -->
        </div>
      </td>
      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
    </tr>
  </table>
</body>
</html>
`

// Button component for emails
const button = (text: string, url: string) => `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
  <tbody>
    <tr>
      <td align="center" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
          <tbody>
            <tr>
              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #6366f1;" valign="top" align="center" bgcolor="#6366f1">
                <a href="${url}" target="_blank" style="border: solid 1px #6366f1; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #6366f1; border-color: #6366f1; color: #ffffff;">${text}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
`

// Email verification template
export const emailVerificationTemplate = (username: string, verificationToken: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

  const content = `
    <h1 style="color: #333333; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center; text-transform: capitalize;">Verify Your Email</h1>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ${username},</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welcome to Sovereign's Call! Please verify your email address to activate your account.</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Click the button below to verify your email:</p>
    ${button("Verify Email", verificationUrl)}
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If you didn't create an account with us, you can safely ignore this email.</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">This verification link will expire in 24 hours.</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><a href="${verificationUrl}" style="color: #6366f1; text-decoration: underline;">${verificationUrl}</a></p>
  `

  return {
    subject: "Verify Your Sovereign's Call Email",
    text: `Hello ${username},\n\nWelcome to Sovereign's Call! Please verify your email address to activate your account.\n\nVerify your email: ${verificationUrl}\n\nIf you didn't create an account with us, you can safely ignore this email.\n\nThis verification link will expire in 24 hours.`,
    html: baseTemplate(content),
  }
}

// Welcome email template
export const welcomeEmailTemplate = (username: string) => {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`
  const characterCreationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/character-creator`

  const content = `
    <h1 style="color: #333333; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center; text-transform: capitalize;">Welcome to Sovereign's Call</h1>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ${username},</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for joining Sovereign's Call! Your account has been successfully created and is ready to use.</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Here are some things you can do next:</p>
    <ul style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
      <li>Create your first character</li>
      <li>Explore the galaxy map</li>
      <li>Join discussions in our forums</li>
      <li>Learn about the factions and lore</li>
    </ul>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Ready to begin your journey?</p>
    ${button("Create Your Character", characterCreationUrl)}
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">We're excited to have you join our community!</p>
  `

  return {
    subject: "Welcome to Sovereign's Call",
    text: `Hello ${username},\n\nThank you for joining Sovereign's Call! Your account has been successfully created and is ready to use.\n\nHere are some things you can do next:\n- Create your first character\n- Explore the galaxy map\n- Join discussions in our forums\n- Learn about the factions and lore\n\nReady to begin your journey? Create your character: ${characterCreationUrl}\n\nWe're excited to have you join our community!`,
    html: baseTemplate(content),
  }
}

// Password reset template
export const passwordResetTemplate = (username: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  const content = `
    <h1 style="color: #333333; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center; text-transform: capitalize;">Reset Your Password</h1>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ${username},</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You requested to reset your password. Please click the button below to set a new password:</p>
    ${button("Reset Password", resetUrl)}
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">This password reset link will expire in 1 hour.</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><a href="${resetUrl}" style="color: #6366f1; text-decoration: underline;">${resetUrl}</a></p>
  `

  return {
    subject: "Reset Your Sovereign's Call Password",
    text: `Hello ${username},\n\nYou requested to reset your password. Please use the following link to set a new password: ${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nThis password reset link will expire in 1 hour.`,
    html: baseTemplate(content),
  }
}

// Username recovery template
export const usernameRecoveryTemplate = (email: string, username: string) => {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`

  const content = `
    <h1 style="color: #333333; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center; text-transform: capitalize;">Your Username</h1>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello,</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You requested to recover your username for Sovereign's Call.</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Your username is:</p>
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">
      ${username}
    </div>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You can now use this username to log in to your account.</p>
    ${button("Log In", loginUrl)}
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If you did not request this, please ignore this email.</p>
  `

  return {
    subject: "Your Sovereign's Call Username",
    text: `Hello,\n\nYou requested to recover your username for Sovereign's Call.\n\nYour username is: ${username}\n\nYou can now use this username to log in to your account: ${loginUrl}\n\nIf you did not request this, please ignore this email.`,
    html: baseTemplate(content),
  }
}

// Character creation confirmation template
export const characterCreationTemplate = (username: string, character: SavedCharacter) => {
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile`

  const content = `
    <h1 style="color: #333333; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center; text-transform: capitalize;">Character Created</h1>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ${username},</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Congratulations! You have successfully created a new character in Sovereign's Call.</p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <h2 style="color: #333333; font-family: sans-serif; font-weight: 300; margin-top: 0;">${character.name}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 40%;"><strong>Faction:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-transform: capitalize;">${character.faction || "None"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Gender:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-transform: capitalize;">${character.gender || "None"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Combat Class:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${character.combatClass || "None"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Story Class:</strong></td>
          <td style="padding: 8px 0;">${character.storyClass || "None"}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You can view and manage your character from your profile page.</p>
    ${button("View Profile", profileUrl)}
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">We hope you enjoy your journey in the Sovereign's Call universe!</p>
  `

  return {
    subject: `Character Created: ${character.name}`,
    text: `Hello ${username},\n\nCongratulations! You have successfully created a new character in Sovereign's Call.\n\nCharacter Details:\nName: ${character.name}\nFaction: ${character.faction || "None"}\nGender: ${character.gender || "None"}\nCombat Class: ${character.combatClass || "None"}\nStory Class: ${character.storyClass || "None"}\n\nYou can view and manage your character from your profile page: ${profileUrl}\n\nWe hope you enjoy your journey in the Sovereign's Call universe!`,
    html: baseTemplate(content),
  }
}

// Forum notification template
export const forumNotificationTemplate = (
  username: string,
  notificationType: "reply" | "mention" | "reaction",
  threadTitle: string,
  authorName: string,
  threadId: string,
  postId: string,
  excerpt?: string,
) => {
  const threadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/forum/thread/${threadId}#post-${postId}`

  let title = ""
  let message = ""

  switch (notificationType) {
    case "reply":
      title = "New Reply to Your Thread"
      message = `<p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">${authorName} has replied to your thread "${threadTitle}".</p>`
      break
    case "mention":
      title = "You Were Mentioned in a Post"
      message = `<p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">${authorName} mentioned you in the thread "${threadTitle}".</p>`
      break
    case "reaction":
      title = "New Reaction to Your Post"
      message = `<p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">${authorName} reacted to your post in the thread "${threadTitle}".</p>`
      break
  }

  const content = `
    <h1 style="color: #333333; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center; text-transform: capitalize;">${title}</h1>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ${username},</p>
    ${message}
    ${
      excerpt
        ? `
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #6366f1;">
      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; font-style: italic;">${excerpt}</p>
    </div>
    `
        : ""
    }
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Click the button below to view the post:</p>
    ${button("View Post", threadUrl)}
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You can manage your notification preferences in your profile settings.</p>
  `

  return {
    subject: `Sovereign's Call Forum: ${title}`,
    text: `Hello ${username},\n\n${notificationType === "reply" ? `${authorName} has replied to your thread "${threadTitle}".` : notificationType === "mention" ? `${authorName} mentioned you in the thread "${threadTitle}".` : `${authorName} reacted to your post in the thread "${threadTitle}".`}${excerpt ? `\n\n"${excerpt}"` : ""}\n\nView the post: ${threadUrl}\n\nYou can manage your notification preferences in your profile settings.`,
    html: baseTemplate(content),
  }
}
