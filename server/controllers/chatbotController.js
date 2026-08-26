// ===============================
// Security Chatbot
// ===============================

exports.chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message",
      });
    }

    const userMessage = message.toLowerCase().trim();

    let reply =
      "I'm your Quick Talk Security Assistant. Ask me about passwords, phishing, OTPs, 2FA, or account security.";

    if (
      userMessage.includes("password") ||
      userMessage.includes("strong password")
    ) {
      reply =
        "Use a strong and unique password with a combination of uppercase letters, lowercase letters, numbers, and special characters. Avoid using personal information.";
    } else if (
      userMessage.includes("phishing") ||
      userMessage.includes("fake link")
    ) {
      reply =
        "Phishing is an attempt to steal sensitive information through fake emails, messages, or websites. Never click suspicious links or share your login credentials.";
    } else if (
      userMessage.includes("otp") ||
      userMessage.includes("verification code")
    ) {
      reply =
        "Never share your OTP or verification code with anyone. A legitimate service will never ask you to reveal your OTP.";
    } else if (
      userMessage.includes("2fa") ||
      userMessage.includes("two factor") ||
      userMessage.includes("two-factor")
    ) {
      reply =
        "Two-factor authentication (2FA) adds an extra layer of security by requiring another verification method in addition to your password.";
    } else if (
      userMessage.includes("secure") ||
      userMessage.includes("protect account") ||
      userMessage.includes("account security")
    ) {
      reply =
        "To protect your account, use a strong password, enable 2FA, avoid suspicious links, never share OTPs, and log out from devices you don't recognize.";
    } else if (
      userMessage.includes("hack") ||
      userMessage.includes("hacked")
    ) {
      reply =
        "If you think your account has been compromised, immediately change your password, enable 2FA, log out of unknown devices, and review your recent account activity.";
    } else if (
      userMessage.includes("hello") ||
      userMessage.includes("hi") ||
      userMessage.includes("hey")
    ) {
      reply =
        "Hello! 👋 I'm your Quick Talk Security Assistant. How can I help you stay safe online?";
    }

    res.status(200).json({
      reply,
    });
  } catch (error) {
    console.log("❌ Chatbot Error:", error);

    res.status(500).json({
      message: "Chatbot failed",
    });
  }
};