export const formatResult = (result: string) => {
  switch (result) {
    case 'WHITE_WINS':
      return 'White Wins';
    case 'BLACK_WINS':
      return 'Black Wins';
    case 'DRAW':
      return 'Draw';
    default:
      return 'Unknown';
  }
};
