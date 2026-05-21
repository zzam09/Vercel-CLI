export const theme = {
  colors: {
    bg: '#ffffff',
    text: '#000000',
    secondary: '#555555',
    accent: '#000000',
    buttonBg: '#000000',
    buttonText: '#ffffff',
    divider: '#333333',
  },
  fonts: {
    heading: "'Arial Black', sans-serif",
    body: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  company: {
    name: "SPACEX",
    address: "HAWTHORNE, CALIFORNIA",
    copyright: "© 2026 SPACEX. ALL RIGHTS RESERVED.",
    logoUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1200&q=80",
    unsubscribeUrl: "#",
    privacyUrl: "#",
  },
  links: {
    portal: "https://spacexmembership-5cdc3.firebaseapp.com/pages/login.html",
  },
  emails: {
    from: "SpaceX Fleet <fleet@spacex.com>",
    welcome: {
      subject: "Welcome to the Fleet",
      buttonText: "ACCESS PORTAL",
      message: "Access granted. Your [SpaceX/Tesla] Member Portal is now online. Use it to schedule your next private meeting, find local meetups, or access exclusive member documents and more.",
    },
    resetPassword: {
      subject: "Password Reset Request",
      buttonText: "RESET PASSWORD",
      message: "We received a request to reset your password for your SpaceX HQ account. If you didn't make this request, you can safely ignore this email.",
    }
  }
};
