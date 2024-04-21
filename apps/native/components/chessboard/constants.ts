import type { PiecesType } from './types';

const PIECES: PiecesType = {
  br: require('./assets/br.png'),
  bp: require('./assets/bp.png'),
  bn: require('./assets/bn.png'),
  bb: require('./assets/bb.png'),
  bq: require('./assets/bq.png'),
  bk: require('./assets/bk.png'),
  wr: require('./assets/wr.png'),
  wn: require('./assets/wn.png'),
  wb: require('./assets/wb.png'),
  wq: require('./assets/wq.png'),
  wk: require('./assets/wk.png'),
  wp: require('./assets/wp.png'),
};

const assets = Object.values(PIECES);

export { assets, PIECES };
