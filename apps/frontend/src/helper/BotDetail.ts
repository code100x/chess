export default function BotDetail(name: string) {
  switch (name) {
    case "Hou Yifan":
      return {
        avatar: "https://images.chesscomfiles.com/uploads/v1/user/261625095.37051d8a.200x200o.1fb113839329.png",
        description: "Hou Yifan is a 4x Women’s World Champion and full-time professor. Ready to be schooled by the second highest-rated woman in history?",
        squareColor:{
          light: '#ed2456',
          dark: '#fffef5'
        }
      };
    case 'Hikaru':
      return {
        avatar: "https://images.chesscomfiles.com/uploads/v1/user/67841086.6fba913f.200x200o.8e4c19ce16c4.png",
        description: "Hikaru Nakamura is a five time US champion and one of the top Grandmasters in the world. Can you take on the challenge of playing against Hikaru?",
        squareColor:{
          light: "#D1E7C5",
          dark: "#8B956D"
        }
      };
    case 'Vishy':
      return {
        avatar: "https://images.chesscomfiles.com/uploads/v1/user/101166996.38aacb4d.200x200o.89d36fbc9fd7.png",
        description: 'Viswanathan "Vishy" Anand is a former world champion and one of the best players of all time! Can you defeat Vishy in a game of chess?',
        squareColor:{
          light: "#749bbf",
          dark: "#f2f1f1"
        }
      };
    case 'Gukesh':
      return {
        avatar: "https://images.chesscomfiles.com/uploads/v1/user/352098241.aaf6bd34.200x200o.597dba92ace2.png",
        description: "D. Gukesh is the second youngest Grandmaster in history. Are you ready to challenge Gukesh and test your skills?",
        squareColor:{
          light: '#F0D9B5',
          dark: '#B58863'
        }
      };
    case 'Magnus':
      return {
        avatar: "https://images.chesscomfiles.com/uploads/v1/user/315574933.74bef40b.200x200o.4f746eeef85e.png",
        description: "Magnus Carlsen is the current World Champion and the highest rated player in history. Can you take down Magnus and claim victory?",
        squareColor:{
          light: "#0ba6de",
          dark: "#f2f1f1"
        }
      };
    default:
      return {
        avatar: "https://images.chesscomfiles.com/uploads/v1/user/160381027.685f9b3d.200x200o.1caacd5ef828.png",
        description: "This bot is a mystery. Can you figure out its secrets?",
        squareColor:{
          light: "#EBEDD0",
          dark: "#739552"
        }
      };
  }
}
