
// http://op12no2.me/toys/lozza

var BUILD = "1.18";

//{{{  history
/*

1.18 Fix alpha/beta mate predicates.
1.18 Fix trapped knights bug (thanks Tamas).
1.18 Fix hash table put bug.
1.18 Add depth element to LMR.
1.18 Increase pruning.
1.18 Remove alpha TT saves in move loop.
1.18 Better tempo.
1.18 Better king safety.
1.18 Better passed pawn eval.
1.18 Fix TC.

1.17 Min move time of 10ms.
1.17 Change futility to depth <= 4 (from 5).
1.17 Use TT at root.
1.17 Increase LMR a bit.
1.17 Add eval tempo back in.
1.17 Remove phase from extend expression.
1.17 R=3 always in NMP.

1.16 Rearrange eval to be based on parts of the Toga User Manual (i.e. Fruit 2.1).
1.16 Send node count back when PV is updated.
1.16 Include non capture promotions in QS.
1.16 Fix unstoppable passer WRT hash (using king squares and turn).
1.16 Fix unstoppable passer values.
1.16 Improve pawn eval.
1.16 Fix bug with futility/LMR else/if.
1.16 Remove tempo from eval.
1.16 Only score knight outputs if isolated from enemy pawns.
1.16 Use fail soft in QS.
1.16 Don't return from QSearch root if in check.
1.16 Reduce futility severity.
1.16 Add king attacks and knight outposts to eval and tidy eval up a bit..
1.16 Don't prune killers!
1.16 Use bits for pawn eval.

1.15 Fix move rank overflow.
1.15 add SQ* constants.
1.15 change futility to 50.
1.15 increase history range.
1.15 Add R|Q on 7th bonus.
1.15 Change futility to 60.
1.15 Change queen to 1000.
1.15 Jiggle what is and isn't predicated on mate scores.
1.15 Add # to PV if mate score.
1.15 Fix queening SAN format.
1.15 Dump arbitrary passed bonuses.
1.15 Dump Connectivity PSTs. They were making passed pawns stop.
1.15 Use a passed pawn PST based on Fruit curve.
1.15 Change PVS condition to !bestMove from numLegalMoves == 1.
1.15 Use Fruit 2.1 piece PSTs.
1.15 Add && !betaMate to futility condition.
1.15 Don't do root Q futility.
1.15 Change double time from 5 to 3 moves after opening.
1.15 Fix +inc time control.
1.15 Add some typed arrays to help V8.
1.15 Tweaks to stop some V8 deoptimising.
1.15 Don't call eval if in check in alphabeta().
1.15 Speed up Q move gen.
1.15 Speed up move gen.
1.15 Speed up mobility;
1.15 Speed up isAttacked();

1.14 Add massive bonus for pawn-supported pawn on 7th rank.
1.14 Don't futility away pawn pushes to 6th rank.
1.14 Fix how PV is displayed WRT hash loops.
1.14 Send node info with PV for ChessGUI, fix hashUsed info.
1.14 Redo how host is detected.
1.14 Add time when fail low at root.
1.14 Add time for first 5 moves after opening.
1.14 Be less confident about time left as number of moves increases.
1.14 Fix time control for increments.
1.14 Reset the stats on the go command.
1.14 Get synchronous PV working with node.js on Windows.
1.14 Check for draws before anything else.
1.14 Don't assume hash move is legal.
1.14 Use |0 as needed and don't use Math.floor() or Math.round() in critical places.
1.14 Remove alphaMate stuff.
1.14 Don't make beta pruning and null move dependent on betaMate.
1.13 Add support for node.js allowing Lozza to run on any platform that supports node.js.
1.13 Send stats back to host early to reset counters.
1.13 Use O not 0 for castling to avoid potential expression confusion.

1.12 Add untuned mobility to eval.
1.12 Tweak King safety.
1.12 Enable LMP now we're using history for move ordering.
1.12 Remove ugly castling running eval in makeMove.
1.12 Increase LMR because of history based move ordering.
1.12 Use history (and PSTs if no history) for move ordering.

1.11 No null move if lone king.
1.11 Change to always write TT, no exceptions.
1.11 Make a micro adjustment to the way Zobrist randoms are generated.
1.11 Implement UCI info hashfull.

1.10 Fix occasional null PVs.
1.10 Fix promotion not being allowed by the web UI.
1.10 Add board, stop, start, clear, id, ping & eval to UCI console.
1.10 Add verbose option to evaluate.

1.9 Add late move pruning.
1.9 Rearrange things a bit.

1.8 Untuned isolated pawns.
1.8 Add pawn hash.
1.8 Use ply (not whole moves) for UCI mate scores.
1.8 Fix bug with best move sometimes being the wrong one because of a timeout.

1.7 Fix LMR condition in root search.
1.7 Untuned beta pruning.
1.7 Untuned passed/doubled pawns.
1.7 Untuned king safety.

1.6 Use end game PSTs for move ordering.
1.6 Only do futility if depth <= 5.
1.6 Check for illegal position by detecting 0 moves at root.
1.6 Fix UCI "mate" score.
1.6 More traditional extension/reduction arrangement.

1.5 Tweak LMR constants.

1.4 Better castling rights update.
1.4 Change futility thresholds.

1.3 Never futility away all moves; do at least one.
1.3 Tweak time controls.

1.2 Point nodes at board so global lookup not needed.
1.2 Add piece lists.

1.1 50 move draw rule.
1.1 Add K+B|N v K+B|N as insufficient material in eval.

1.0 Only reset TT on UCINEWGAME command.  Seems to work OK at last.

0.9 Encode mate scores for UI.
0.9 Use separate PSTs for move ordering.

0.8 use simple arrays for piece counts and add colour counts.
0.8 Split runningEval into runningEvalS and runningEval E and combine in evaluate();
0.8 Inline various functions.

0.7 Fix repetition detection at last.

0.6 Base LMR on the move base.
0.6 Just use > alpha for LMR research.
0.6 Fix hash update bugs.
0.6 move mate distance and rep check tests to pre horizon.
0.6 Only extend at root and if depth below horizon.
0.6 Remove lone king stuff.

0.5 Mate distance pruning.
0.5 No LMR if lone king.

0.4 No null move if a lone king on the board.
0.4 Add detection of insufficient material draws.
0.4 Add very primitive king safety to eval.
0.4 Change pCounts into wCount and bCount.
0.4 Set contempt to 0.
0.4 Fix fail soft QS bug on beta cut.

0.3 Facilitate N messages in one UCI message string.
0.3 Fix bug where search() and alphabeta() returned -INFINITY instead of oAlpha.
0.3 Adjust MATE score in TT etc.

0.2 Allow futility to filter all moves and return oAlpha in that case.
0.2 Fix infinite loops when showing PV.
0.2 Fix mate killer addition condition.
0.2 Generalise bishop counting using board.pCounts.
0.2 Don't allow a killer to be the (current) hash.
0.2 Don't research ALL node LMR fails unless R is set!
0.2 Arrange things so that QS doesn't use or affect node killers/hashes etc.  In tests it's less nodes.
0.2 Increase asp window and add time on ID research.
0.2 Add crude bishop pair bonus imp.  NB: updating a piece count array using a[i]++ and a[i]-- was too slow!!
0.2 Use tapered PSTs.

0.1 Fix bug in QS.  It *must not* fail soft.

*/

//}}}
//{{{  try
/*

Increase time if one of top 2 root based moves changes and ply > N.

/*
//}}}
//{{{  todo
/*

My own eval.
Better endgame knowledge.
SEE.

*/

//}}}
//{{{  detect host

var HOST_WEB     = 0;
var HOST_NODEJS  = 1;  // and jxCore.
var HOST_JSUCI   = 2;
var HOSTS        = ['Web','Node','jsUCI'];
var lozzaHost    = HOST_WEB;

if ((typeof process) != 'undefined')

  lozzaHost = HOST_NODEJS;  // or jxCore.

else if ((typeof lastMessage) != 'undefined')

  lozzaHost = HOST_JSUCI;

//}}}
//{{{  seed
/**

seedrandom.js
=============

Seeded random number generator for Javascript.

version 2.3.10
Author: David Bau
Date: 2014 Sep 20

Can be used as a plain script, a node.js module or an AMD module.

Script tag usage
----------------

<script src=//cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.10/seedrandom.min.js>
</script>

// Sets Math.random to a PRNG initialized using the given explicit seed.
Math.seedrandom('hello.');
console.log(Math.random());          // Always 0.9282578795792454
console.log(Math.random());          // Always 0.3752569768646784

// Sets Math.random to an ARC4-based PRNG that is autoseeded using the
// current time, dom state, and other accumulated local entropy.
// The generated seed string is returned.
Math.seedrandom();
console.log(Math.random());          // Reasonably unpredictable.

// Seeds using the given explicit seed mixed with accumulated entropy.
Math.seedrandom('added entropy.', { entropy: true });
console.log(Math.random());          // As unpredictable as added entropy.

// Use "new" to create a local prng without altering Math.random.
var myrng = new Math.seedrandom('hello.');
console.log(myrng());                // Always 0.9282578795792454


Node.js usage
-------------

npm install seedrandom

// Local PRNG: does not affect Math.random.
var seedrandom = require('seedrandom');
var rng = seedrandom('hello.');
console.log(rng());                  // Always 0.9282578795792454

// Autoseeded ARC4-based PRNG.
rng = seedrandom();
console.log(rng());                  // Reasonably unpredictable.

// Global PRNG: set Math.random.
seedrandom('hello.', { global: true });
console.log(Math.random());          // Always 0.9282578795792454

// Mixing accumulated entropy.
rng = seedrandom('added entropy.', { entropy: true });
console.log(rng());                  // As unpredictable as added entropy.


Require.js usage
----------------

Similar to node.js usage:

bower install seedrandom

require(['seedrandom'], function(seedrandom) {
  var rng = seedrandom('hello.');
  console.log(rng());                  // Always 0.9282578795792454
});


Network seeding
---------------

<script src=//cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.10/seedrandom.min.js>
</script>

<!-- Seeds using urandom bits from a server. -->
<script src=//jsonlib.appspot.com/urandom?callback=Math.seedrandom">
</script>

<!-- Seeds mixing in random.org bits -->
<script>
(function(x, u, s){
  try {
    // Make a synchronous request to random.org.
    x.open('GET', u, false);
    x.send();
    s = unescape(x.response.trim().replace(/^|\s/g, '%'));
  } finally {
    // Seed with the response, or autoseed on failure.
    Math.seedrandom(s, !!s);
  }
})(new XMLHttpRequest, 'https://www.random.org/integers/' +
  '?num=256&min=0&max=255&col=1&base=16&format=plain&rnd=new');
</script>

Reseeding using user input
--------------------------

var seed = Math.seedrandom();        // Use prng with an automatic seed.
document.write(Math.random());       // Pretty much unpredictable x.

var rng = new Math.seedrandom(seed); // A new prng with the same seed.
document.write(rng());               // Repeat the 'unpredictable' x.

function reseed(event, count) {      // Define a custom entropy collector.
  var t = [];
  function w(e) {
    t.push([e.pageX, e.pageY, +new Date]);
    if (t.length &lt; count) { return; }
    document.removeEventListener(event, w);
    Math.seedrandom(t, { entropy: true });
  }
  document.addEventListener(event, w);
}
reseed('mousemove', 100);            // Reseed after 100 mouse moves.

The "pass" option can be used to get both the prng and the seed.
The following returns both an autoseeded prng and the seed as an object,
without mutating Math.random:

var obj = Math.seedrandom(null, { pass: function(prng, seed) {
  return { random: prng, seed: seed };
}});


Version notes
-------------

The random number sequence is the same as version 1.0 for string seeds.
* Version 2.0 changed the sequence for non-string seeds.
* Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
* Version 2.2 alters non-crypto autoseeding to sweep up entropy from plugins.
* Version 2.3 adds support for "new", module loading, and a null seed arg.
* Version 2.3.1 adds a build environment, module packaging, and tests.
* Version 2.3.4 fixes bugs on IE8, and switches to MIT license.
* Version 2.3.6 adds a readable options object argument.
* Version 2.3.10 adds support for node.js crypto (contributed by ctd1500).

The standard ARC4 key scheduler cycles short keys, which means that
seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
Therefore it is a good idea to add a terminator to avoid trivial
equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
Starting with version 2.0, a terminator is added automatically for
non-string seeds, so seeding with the number 111 is the same as seeding
with '111\0'.

When seedrandom() is called with zero args or a null seed, it uses a
seed drawn from the browser crypto object if present.  If there is no
crypto support, seedrandom() uses the current time, the native rng,
and a walk of several DOM objects to collect a few bits of entropy.

Each time the one- or two-argument forms of seedrandom are called,
entropy from the passed seed is accumulated in a pool to help generate
future seeds for the zero- and two-argument forms of seedrandom.

On speed - This javascript implementation of Math.random() is several
times slower than the built-in Math.random() because it is not native
code, but that is typically fast enough.  Some details (timings on
Chrome 25 on a 2010 vintage macbook):

* seeded Math.random()          - avg less than 0.0002 milliseconds per call
* seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
* seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
* seedrandom() with crypto      - avg less than 0.2 milliseconds per call

Autoseeding without crypto is somewhat slower, about 20-30 milliseconds on
a 2012 windows 7 1.5ghz i5 laptop, as seen on Firefox 19, IE 10, and Opera.
Seeded rng calls themselves are fast across these browsers, with slowest
numbers on Opera at about 0.0005 ms per seeded Math.random().


LICENSE (MIT)
-------------

Copyright 2014 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
(function (
    global, pool, math, width, chunks, digits, module, define, rngname) {

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;

//
// seedrandom()
// This is the seedrandom function described above.
//
var impl = math['seed' + rngname] = function(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      // If called as a method of Math (Math.seedrandom()), mutate Math.random
      // because that is how seedrandom.js has worked since v1.0.  Otherwise,
      // it is a newer calling convention, so return the prng directly.
      function(prng, seed, is_math_call) {
        if (is_math_call) { math[rngname] = prng; return seed; }
        else return prng;
      })(

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  }, shortseed, 'global' in options ? options.global : (this == math));
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array|Navigator=} seed */
function autoseed(seed) {
  try {
    if (nodecrypto) return tostring(nodecrypto.randomBytes(width));
    global.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, global, (seed = global.navigator) && seed.plugins,
      global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math[rngname](), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if (module && module.exports) {
  module.exports = impl;
  try {
    // When in node.js, try using crypto package for autoseeding.
    nodecrypto = require('crypto');
  } catch (ex) {}
} else if (define && define.amd) {
  define(function() { return impl; });
}

//
// Node.js native crypto support.
//

// End anonymous scope, and pass initial values.
})(
  this,   // global window object
  [],     // pool: entropy pool starts empty
  Math,   // math: package containing random, pow, and seedrandom
  256,    // width: each RC4 output is 0 <= x < 256
  6,      // chunks: at least six RC4 outputs for each double
  52,     // digits: there are 52 significant digits in a double
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define,  // present with an AMD loader
  'random'// rngname: name for Math.random and Math.seedrandom
);

Math.seedrandom('Lozza rules OK');  //always generates the same sequence of PRNs

//}}}
//{{{  constants

var MAX_PLY         = 100;                // limited by lozza.board.ttDepth bits.
var MAX_MOVES       = 250;
var INFINITY        = 30000;              // limited by lozza.board.ttScore bits.
var MATE            = 20000;
var MINMATE         = MATE - 2*MAX_PLY;
var CONTEMPT        = 0;
var NULL_Y          = 1;
var NULL_N          = 0;
var INCHECK_UNKNOWN = MATE + 1;
var TTSCORE_UNKNOWN = MATE + 2;
var ASP_MAX         = 75;
var ASP_DELTA       = 3;
var ASP_MIN         = 10;
var EMPTY           = 0;
var UCI_FMT         = 0;
var SAN_FMT         = 1;

var WHITE   = 0x0;                // toggle with: ~turn & COLOR_MASK
var BLACK   = 0x8;
var I_WHITE = 0;                  // 0/1 colour index, compute with: turn >>> 3
var I_BLACK = 1;
var M_WHITE = 1;
var M_BLACK = -1;                 // +1/-1 colour multiplier, compute with: (-turn >> 31) | 1

var PIECE_MASK = 0x7;
var COLOR_MASK = 0x8;

var TT_EMPTY  = 0;
var TT_EXACT  = 1;
var TT_BETA   = 2;
var TT_ALPHA  = 3;

var MOVE_TO_BITS      = 0;
var MOVE_FR_BITS      = 8;
var MOVE_TOOBJ_BITS   = 16;
var MOVE_FROBJ_BITS   = 20;
var MOVE_PROMAS_BITS  = 29;

var MOVE_TO_MASK       = 0x000000FF;
var MOVE_FR_MASK       = 0x0000FF00;
var MOVE_TOOBJ_MASK    = 0x000F0000;
var MOVE_FROBJ_MASK    = 0x00F00000;
var MOVE_PAWN_MASK     = 0x01000000;
var MOVE_EPTAKE_MASK   = 0x02000000;
var MOVE_EPMAKE_MASK   = 0x04000000;
var MOVE_CASTLE_MASK   = 0x08000000;
var MOVE_PROMOTE_MASK  = 0x10000000;
var MOVE_PROMAS_MASK   = 0x60000000;  // NBRQ.
var MOVE_SPARE2_MASK   = 0x80000000;

var MOVE_SPECIAL_MASK  = MOVE_CASTLE_MASK | MOVE_PROMOTE_MASK | MOVE_EPTAKE_MASK | MOVE_EPMAKE_MASK; // need extra work in make move.
var KEEPER_MASK        = MOVE_CASTLE_MASK | MOVE_PROMOTE_MASK | MOVE_EPTAKE_MASK | MOVE_TOOBJ_MASK;  // futility etc.

var NULL   = 0;
var PAWN   = 1;
var KNIGHT = 2;
var BISHOP = 3;
var ROOK   = 4;
var QUEEN  = 5;
var KING   = 6;
var EDGE   = 7;
var NO_Z   = 8;

var W_PAWN   = PAWN;
var W_KNIGHT = KNIGHT;
var W_BISHOP = BISHOP;
var W_ROOK   = ROOK;
var W_QUEEN  = QUEEN;
var W_KING   = KING;

var B_PAWN   = PAWN   | BLACK;
var B_KNIGHT = KNIGHT | BLACK;
var B_BISHOP = BISHOP | BLACK;
var B_ROOK   = ROOK   | BLACK;
var B_QUEEN  = QUEEN  | BLACK;
var B_KING   = KING   | BLACK;

//
// E == EMPTY, X = OFF BOARD, - == CANNOT HAPPEN
//
//               0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
//               E  W  W  W  W  W  W  X  -  B  B  B  B  B  B  -
//               E  P  N  B  R  Q  K  X  -  P  N  B  R  Q  K  -

var IS_O      = [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0];
var IS_E      = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IS_OE     = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0];
var IS_KN     = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
var IS_P      = [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];

var IS_NBRQKE = [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0]
var IS_RQKE   = [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0]
var IS_QKE    = [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0]

var IS_W      = [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IS_WE     = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IS_WP     = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IS_WN     = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IS_WB     = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IS_WBQ    = [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var IS_WRQ    = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var IS_B      = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
var IS_BE     = [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
var IS_BP     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
var IS_BN     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
var IS_BB     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
var IS_BBQ    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0];
var IS_BRQ    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0];

var PPHASE = 0;
var NPHASE = 1;
var BPHASE = 1;
var RPHASE = 2;
var QPHASE = 4;
var VPHASE = [0,PPHASE,NPHASE,BPHASE,RPHASE,QPHASE,0];
var TPHASE = PPHASE*16 + NPHASE*4 + BPHASE*4 + RPHASE*4 + QPHASE*2;
var EPHASE = 180;

var A1 = 110;
var B1 = 111;
var C1 = 112;
var D1 = 113;
var E1 = 114;
var F1 = 115;
var G1 = 116;
var H1 = 117;

var A8 = 26;
var B8 = 27;
var C8 = 28;
var D8 = 29;
var E8 = 30;
var F8 = 31;
var G8 = 32;
var H8 = 33;

var SQA1 = 110;
var SQB1 = 111;
var SQC1 = 112;
var SQD1 = 113;
var SQE1 = 114;
var SQF1 = 115;
var SQG1 = 116;
var SQH1 = 117;

var SQA2 = 98;
var SQB2 = 99;
var SQC2 = 100;
var SQD2 = 101;
var SQE2 = 102;
var SQF2 = 103;
var SQG2 = 104;
var SQH2 = 105;

var SQA3 = 86;
var SQB3 = 87;
var SQC3 = 88;
var SQD3 = 89;
var SQE3 = 90;
var SQF3 = 91;
var SQG3 = 92;
var SQH3 = 93;

var SQA4 = 74;
var SQB4 = 75;
var SQC4 = 76;
var SQD4 = 77;
var SQE4 = 78;
var SQF4 = 79;
var SQG4 = 80;
var SQH4 = 81;

var SQA5 = 62;
var SQB5 = 63;
var SQC5 = 64;
var SQD5 = 65;
var SQE5 = 66;
var SQF5 = 67;
var SQG5 = 68;
var SQH5 = 69;

var SQA6 = 50;
var SQB6 = 51;
var SQC6 = 52;
var SQD6 = 53;
var SQE6 = 54;
var SQF6 = 55;
var SQG6 = 56;
var SQH6 = 57;

var SQA7 = 38;
var SQB7 = 39;
var SQC7 = 40;
var SQD7 = 41;
var SQE7 = 42;
var SQF7 = 43;
var SQG7 = 44;
var SQH7 = 45;

var SQA8 = 26;
var SQB8 = 27;
var SQC8 = 28;
var SQD8 = 29;
var SQE8 = 30;
var SQF8 = 31;
var SQG8 = 32;
var SQH8 = 33;


var MOVE_E1G1 = MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | G1;
var MOVE_E1C1 = MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | C1;
var MOVE_E8G8 = MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | G8;
var MOVE_E8C8 = MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | C8;

var WHITE_RIGHTS_KING  = 0x00000001;
var WHITE_RIGHTS_QUEEN = 0x00000002;
var BLACK_RIGHTS_KING  = 0x00000004;
var BLACK_RIGHTS_QUEEN = 0x00000008;
var WHITE_RIGHTS       = WHITE_RIGHTS_QUEEN | WHITE_RIGHTS_KING;
var BLACK_RIGHTS       = BLACK_RIGHTS_QUEEN | BLACK_RIGHTS_KING;

var  MASK_RIGHTS =  [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, ~8, 15, 15, 15, ~12,15, 15, ~4, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, ~2, 15, 15, 15, ~3, 15, 15, ~1, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15];

var WP_OFFSET_ORTH  = -12;
var WP_OFFSET_DIAG1 = -13;
var WP_OFFSET_DIAG2 = -11;

var BP_OFFSET_ORTH  = 12;
var BP_OFFSET_DIAG1 = 13;
var BP_OFFSET_DIAG2 = 11;

var KNIGHT_OFFSETS  = [25,-25,23,-23,14,-14,10,-10];
var BISHOP_OFFSETS  = [11,-11,13,-13];
var ROOK_OFFSETS    =               [1,-1,12,-12];
var QUEEN_OFFSETS   = [11,-11,13,-13,1,-1,12,-12];
var KING_OFFSETS    = [11,-11,13,-13,1,-1,12,-12];

var OFFSETS = [0,0,KNIGHT_OFFSETS,BISHOP_OFFSETS,ROOK_OFFSETS,QUEEN_OFFSETS,KING_OFFSETS];
var LIMITS  = [0,1,1,8,8,8,1];

var VALUE_PAWN   = 100;
var VALUE_KNIGHT = 325;
var VALUE_BISHOP = 325;
var VALUE_ROOK   = 500;
var VALUE_QUEEN  = 1000;
var VALUE_KING   = 10000;
var VALUE_VECTOR = [0,VALUE_PAWN,VALUE_KNIGHT,VALUE_BISHOP,VALUE_ROOK,VALUE_QUEEN,VALUE_KING];
var RANK_VECTOR  = [0,1,         2,           2,           4,         5,          6];  // for move sorting.

var NULL_PST =        [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WPAWN_PSTS =      [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0, -15,  -5,   0,   5,   5,   0,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   0,   5,   5,   0,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   0,   5,   5,   0,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   0,  15,  15,   0,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   0,  25,  25,   0,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   0,  15,  15,   0,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   0,   5,   5,   0,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   0,   5,   5,   0,  -5, -15,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WPAWN_PSTE =      [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WKNIGHT_PSTS =    [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,-135, -25, -15, -10, -10, -15, -25,-135,   0,   0,
                       0,   0, -20, -10,   0,   5,   5,   0, -10, -20,   0,   0,
                       0,   0,  -5,   5,  15,  20,  20,  15,   5,  -5,   0,   0,
                       0,   0,  -5,   5,  15,  20,  20,  15,   5,  -5,   0,   0,
                       0,   0, -10,   0,  10,  15,  15,  10,   0, -10,   0,   0,
                       0,   0, -20, -10,   0,   5,   5,   0, -10, -20,   0,   0,
                       0,   0, -35, -25, -15, -10, -10, -15, -25, -35,   0,   0,
                       0,   0, -50, -40, -30, -25, -25, -30, -40, -50,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WKNIGHT_PSTE =    [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0, -40, -30, -20, -15, -15, -20, -30, -40,   0,   0,
                       0,   0, -30, -20, -10,  -5,  -5, -10, -20, -30,   0,   0,
                       0,   0, -20, -10,   0,   5,   5,   0, -10, -20,   0,   0,
                       0,   0, -15,  -5,   5,  10,  10,   5,  -5, -15,   0,   0,
                       0,   0, -15,  -5,   5,  10,  10,   5,  -5, -15,   0,   0,
                       0,   0, -20, -10,   0,   5,   5,   0, -10, -20,   0,   0,
                       0,   0, -30, -20, -10,  -5,  -5, -10, -20, -30,   0,   0,
                       0,   0, -40, -30, -20, -15, -15, -20, -30, -40,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WBISHOP_PSTS =    [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,  -8,  -8,  -6,  -4,  -4,  -6,  -8,  -8,   0,   0,
                       0,   0,  -8,   0,  -2,   0,   0,  -2,   0,  -8,   0,   0,
                       0,   0,  -6,  -2,   4,   2,   2,   4,  -2,  -6,   0,   0,
                       0,   0,  -4,   0,   2,   8,   8,   2,   0,  -4,   0,   0,
                       0,   0,  -4,   0,   2,   8,   8,   2,   0,  -4,   0,   0,
                       0,   0,  -6,  -2,   4,   2,   2,   4,  -2,  -6,   0,   0,
                       0,   0,  -8,   0,  -2,   0,   0,  -2,   0,  -8,   0,   0,
                       0,   0, -18, -18, -16, -14, -14, -16, -18, -18,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WBISHOP_PSTE =    [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0, -18, -12,  -9,  -6,  -6,  -9, -12, -18,   0,   0,
                       0,   0, -12,  -6,  -3,   0,   0,  -3,  -6, -12,   0,   0,
                       0,   0,  -9,  -3,   0,   3,   3,   0,  -3,  -9,   0,   0,
                       0,   0,  -6,   0,   3,   6,   6,   3,   0,  -6,   0,   0,
                       0,   0,  -6,   0,   3,   6,   6,   3,   0,  -6,   0,   0,
                       0,   0,  -9,  -3,   0,   3,   3,   0,  -3,  -9,   0,   0,
                       0,   0, -12,  -6,  -3,   0,   0,  -3,  -6, -12,   0,   0,
                       0,   0, -18, -12,  -9,  -6,  -6,  -9, -12, -18,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WROOK_PSTS =      [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,  -6,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,  -6,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,  -6,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,  -5,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,  -5,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,  -5,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,  -5,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,  -6,  -3,   0,   3,   3,   0,  -3,  -6,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WROOK_PSTE =      [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WQUEEN_PSTS =     [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,  -5,  -5,  -5,  -5,  -5,  -5,  -5,  -5,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WQUEEN_PSTE =     [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0, -24, -16, -12,  -8,  -8, -12, -16, -24,   0,   0,
                       0,   0, -16,  -8,  -4,   0,   0,  -4,  -8, -16,   0,   0,
                       0,   0, -12,  -4,   0,   4,   4,   0,  -4, -12,   0,   0,
                       0,   0,  -8,   0,   4,   8,   8,   4,   0,  -8,   0,   0,
                       0,   0,  -8,   0,   4,   8,   8,   4,   0,  -8,   0,   0,
                       0,   0, -12,  -4,   0,   4,   4,   0,  -4, -12,   0,   0,
                       0,   0, -16,  -8,  -4,   0,   0,  -4,  -8, -16,   0,   0,
                       0,   0, -24, -16, -12,  -8,  -8, -12, -16, -24,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WKING_PSTS =      [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0, -40, -30, -50, -70, -70, -50, -30, -40,   0,   0,
                       0,   0, -30, -20, -40, -60, -60, -40, -20, -30,   0,   0,
                       0,   0, -20, -10, -30, -50, -50, -30, -10, -20,   0,   0,
                       0,   0, -10,   0, -20, -40, -40, -20,   0, -10,   0,   0,
                       0,   0,   0,  10, -10, -30, -30, -10,  10,   0,   0,   0,
                       0,   0,  10,  20,   0, -20, -20,   0,  20,  10,   0,   0,
                       0,   0,  30,  40,  20,   0,   0,  20,  40,  30,   0,   0,
                       0,   0,  40,  50,  30,  10,  10,  30,  50,  40,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WKING_PSTE =      [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0, -72, -48, -36, -24, -24, -36, -48, -72,   0,   0,
                       0,   0, -48, -24, -12,   0,   0, -12, -24, -48,   0,   0,
                       0,   0, -36, -12,   0,  12,  12,   0, -12, -36,   0,   0,
                       0,   0, -24,   0,  12,  24,  24,  12,   0, -24,   0,   0,
                       0,   0, -24,   0,  12,  24,  24,  12,   0, -24,   0,   0,
                       0,   0, -36, -12,   0,  12,  12,   0, -12, -36,   0,   0,
                       0,   0, -48, -24, -12,   0,   0, -12, -24, -48,   0,   0,
                       0,   0, -72, -48, -36, -24, -24, -36, -38, -72,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WOUTPOST =        [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   4,   5,   5,   4,   0,   0,   0,   0,
                       0,   0,   0,   2,   5,  10,  10,   5,   2,   0,   0,   0,
                       0,   0,   0,   2,   5,  10,  10,   5,   2,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                       0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

function _pst2Black (from,to) {
  for (var i=0; i < 12; i++) {
    var frbase = i*12;
    var tobase = (11-i)*12;
    for (var j=0; j < 12; j++)
      to[tobase+j] = from[frbase+j];
  }
}

var BPAWN_PSTS   = Array(144);
var BPAWN_PSTE   = Array(144);
var BKNIGHT_PSTS = Array(144);
var BKNIGHT_PSTE = Array(144);
var BBISHOP_PSTS = Array(144);
var BBISHOP_PSTE = Array(144);
var BROOK_PSTS   = Array(144);
var BROOK_PSTE   = Array(144);
var BQUEEN_PSTS  = Array(144);
var BQUEEN_PSTE  = Array(144);
var BKING_PSTS   = Array(144);
var BKING_PSTE   = Array(144);

var BOUTPOST     = Array(144);

_pst2Black(WPAWN_PSTS,   BPAWN_PSTS);
_pst2Black(WPAWN_PSTE,   BPAWN_PSTE);
_pst2Black(WKNIGHT_PSTS, BKNIGHT_PSTS);
_pst2Black(WKNIGHT_PSTE, BKNIGHT_PSTE);
_pst2Black(WBISHOP_PSTS, BBISHOP_PSTS);
_pst2Black(WBISHOP_PSTE, BBISHOP_PSTE);
_pst2Black(WROOK_PSTS,   BROOK_PSTS);
_pst2Black(WROOK_PSTE,   BROOK_PSTE);
_pst2Black(WQUEEN_PSTS,  BQUEEN_PSTS);
_pst2Black(WQUEEN_PSTE,  BQUEEN_PSTE);
_pst2Black(WKING_PSTS,   BKING_PSTS);
_pst2Black(WKING_PSTE,   BKING_PSTE);

var WS_PST = [NULL_PST, WPAWN_PSTS,  WKNIGHT_PSTS, WBISHOP_PSTS, WROOK_PSTS, WQUEEN_PSTS, WKING_PSTS]; // opening/middle eval.
var WE_PST = [NULL_PST, WPAWN_PSTE,  WKNIGHT_PSTE, WBISHOP_PSTE, WROOK_PSTE, WQUEEN_PSTE, WKING_PSTE]; // end eval.
var WM_PST = [NULL_PST, WPAWN_PSTE,  WKNIGHT_PSTE, WBISHOP_PSTE, WROOK_PSTE, WQUEEN_PSTE, WKING_PSTE]; // move eval.

var BS_PST = [NULL_PST, BPAWN_PSTS,  BKNIGHT_PSTS, BBISHOP_PSTS, BROOK_PSTS, BQUEEN_PSTS, BKING_PSTS];
var BE_PST = [NULL_PST, BPAWN_PSTE,  BKNIGHT_PSTE, BBISHOP_PSTE, BROOK_PSTE, BQUEEN_PSTE, BKING_PSTE];
var BM_PST = [NULL_PST, BPAWN_PSTE,  BKNIGHT_PSTE, BBISHOP_PSTE, BROOK_PSTE, BQUEEN_PSTE, BKING_PSTE];

_pst2Black(WOUTPOST, BOUTPOST);

var  B88 =  [26, 27, 28, 29, 30, 31, 32, 33,
             38, 39, 40, 41, 42, 43, 44, 45,
             50, 51, 52, 53, 54, 55, 56, 57,
             62, 63, 64, 65, 66, 67, 68, 69,
             74, 75, 76, 77, 78, 79, 80, 81,
             86, 87, 88, 89, 90, 91, 92, 93,
             98, 99, 100,101,102,103,104,105,
             110,111,112,113,114,115,116,117];

var COORDS =   ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', 'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', '??', '??',
                '??', '??', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', '??', '??',
                '??', '??', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', '??', '??',
                '??', '??', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', '??', '??',
                '??', '??', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', '??', '??',
                '??', '??', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', '??', '??',
                '??', '??', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', '??', '??',
                '??', '??', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'];

var NAMES    = ['-','P','N','B','R','Q','K','-'];
var PROMOTES = ['n','b','r','q'];                  // 0-3 encoded in move.

var  RANK =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0,
              0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0,
              0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0,
              0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0,
              0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0,
              0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
              0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
              0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var  FILE =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var  CORNERS=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var  WSQUARE=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var  BSQUARE=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
              0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var DIAG1 =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0,
              0, 0, 3, 4, 5, 6, 7, 8, 9,10, 0, 0,
              0, 0, 4, 5, 6, 7, 8, 9,10,11, 0, 0,
              0, 0, 5, 6, 7, 8, 9,10,11,12, 0, 0,
              0, 0, 6, 7, 8, 9,10,11,12,13, 0, 0,
              0, 0, 7, 8, 9,10,11,12,23,14, 0, 0,
              0, 0, 8, 9,10,11,12,23,14,15, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var DIAG2 =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0,
              0, 0, 9, 8, 7, 6, 5, 4, 3, 2, 0, 0,
              0, 0, 10,9, 8, 7, 6, 5, 4, 3, 0, 0,
              0, 0, 11,10,9, 8, 7, 6, 5, 4, 0, 0,
              0, 0, 12,11,10,9, 8, 7, 6, 5, 0, 0,
              0, 0, 13,12,11,10,9, 8, 7, 6, 0, 0,
              0, 0, 14,13,12,11,10,9, 8, 7, 0, 0,
              0, 0, 15,14,13,12,11,10,9, 8, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var MAP = [];

MAP['p'] = B_PAWN;
MAP['n'] = B_KNIGHT;
MAP['b'] = B_BISHOP;
MAP['r'] = B_ROOK;
MAP['q'] = B_QUEEN;
MAP['k'] = B_KING;
MAP['P'] = W_PAWN;
MAP['N'] = W_KNIGHT;
MAP['B'] = W_BISHOP;
MAP['R'] = W_ROOK;
MAP['Q'] = W_QUEEN;
MAP['K'] = W_KING;

var UMAP = [];

UMAP[B_PAWN]   = 'p';
UMAP[B_KNIGHT] = 'n';
UMAP[B_BISHOP] = 'b';
UMAP[B_ROOK]   = 'r';
UMAP[B_QUEEN]  = 'q';
UMAP[B_KING]   = 'k';
UMAP[W_PAWN]   = 'P';
UMAP[W_KNIGHT] = 'N';
UMAP[W_BISHOP] = 'B';
UMAP[W_ROOK]   = 'R';
UMAP[W_QUEEN]  = 'Q';
UMAP[W_KING]   = 'K';

var STARRAY = Array(144);
var WKZONES = Array(144);
var BKZONES = Array(144);
var DIST    = Array(144);

//}}}

//{{{  lozChess class

//{{{  lozChess
//
//   node[0]
//     .root            =  true;
//     .ply             =  0
//     .parentNode      => NULL
//     .grandParentNode => NULL
//     .childNode       => node[1];
//
//   node[1]
//     .root            =  false;
//     .ply             =  1
//     .parentNode      => node[0]
//     .grandParentNode => NULL
//     .childNode       => node[2];
//
//  ...
//
//   node[n]
//     .root            =  false;
//     .ply             =  n
//     .parentNode      => node[n-1]
//     .grandParentNode => node[n-2] | NULL
//     .childNode       => node[n+1] | NULL
//
//   etc
//
//  Search starts at node[0] with a depth spec.  In Lozza "depth" is the depth to
//  search and can jump around all over the place with extensions and reductions,
//  "ply" is the distance from the root.  Killers are stored in nodes because they
//  need to be ply based not depth based.  The .grandParentNode pointer can be used
//  to easily look up killers for the previous move of the same colour.
//

function lozChess () {

  this.nodes = Array(MAX_PLY);

  var parentNode = null;
  for (var i=0; i < this.nodes.length; i++) {
    this.nodes[i]      = new lozNode(parentNode);
    this.nodes[i].ply  = i;                     // distance to root node for mate etc.
    parentNode         = this.nodes[i];
    this.nodes[i].root = i == 0;
  }

  this.board = new lozBoard();
  this.stats = new lozStats();
  this.uci   = new lozUCI();

  this.rootNode = this.nodes[0];

  for (var i=0; i < this.nodes.length; i++)
    this.nodes[i].board = this.board;

  this.board.init();

  //{{{  init STARRAY (b init in here)
  //
  // STARRAY can be used when in check to filter moves that cannot possibly
  // be legal without overhead.  Happily EP captures fall out in the wash
  // since they are to a square that a knight would be checking the king on.
  //
  // e.g. with a king on A1, STARRAY[A1] =
  //
  // 1  0  0  0  0  0  0  2
  // 1  0  0  0  0  0  2  0
  // 1  0  0  0  0  2  0  0
  // 1  0  0  0  2  0  0  0
  // 1  0  0  2  0  0  0  0
  // 1 -1  2  0  0  0  0  0
  // 1  2 -1  0  0  0  0  0
  // 0  3  3  3  3  3  3  3
  //
  // Now condsider a rook on H1.  Slides to H2-H7 are not considered because they
  // do not hit a ray and thus cannot be used to block a check.  The rook slide
  // to H8 hits a ray, but corners are special cases - you can't slide to a corner
  // to block a check, so it's also ignored.  The slides to G1-B1 hit rays but the
  // from and to rays are the same, so again these slides cannot block a check.
  // Captures to any ray are always considered. -1 = knight attacks, so slides must
  // be to rays > 0 to be considered at all.  This vastly reduces the number of
  // moves to consider when in check and is available pretty much for free.  Captures
  // could be further pruned by considering the piece type encountered - i.e. can it
  // theoretically be giving check or not.
  //
  
  for (var i=0; i < this.board.b.length; i++)
    this.board.b[i] = EDGE;
  
  for (var i=0; i < B88.length; i++)
    this.board.b[B88[i]] = NULL;
  
  for (var i=0; i < 144; i++) {
    STARRAY[i] = Array(144);
    for (var j=0; j < 144; j++)
      STARRAY[i][j] = 0;
  }
  
  for (var i=0; i < B88.length; i++) {
    var sq = B88[i];
    for (var j=0; j < KING_OFFSETS.length; j++) {
      var offset = KING_OFFSETS[j];
      for (var k=1; k < 8; k++) {
        var dest = sq + k * offset;
        if (this.board.b[dest] == EDGE)
          break;
        STARRAY[sq][dest] = j+1;
      }
    }
    for (var j=0; j < KNIGHT_OFFSETS.length; j++) {
      var offset = KNIGHT_OFFSETS[j];
      var dest   = sq + offset;
      if (this.board.b[dest] == EDGE)
        continue;
      STARRAY[sq][dest] = -1;
    }
  }
  
  //}}}
  //{{{  init *KZONES
  
  for (var i=0; i < 144; i++) {
  
    WKZONES[i] = Array(144);
    for (var j=0; j < 144; j++)
      WKZONES[i][j] = 0;
  
    BKZONES[i] = Array(144);
    for (var j=0; j < 144; j++)
      BKZONES[i][j] = 0;
  }
  
  for (var i=0; i < B88.length; i++) {
  
    var sq  = B88[i];
    var wkz = WKZONES[sq];
    var bkz = BKZONES[sq];
  
  // W
  
    if (!this.board.b[sq+13]) wkz[sq+13]=1;
    if (!this.board.b[sq+12]) wkz[sq+12]=1;
    if (!this.board.b[sq+11]) wkz[sq+11]=1;
  
    if (!this.board.b[sq-1])  wkz[sq-1]=1;
    if (!this.board.b[sq+0])  wkz[sq+0]=1;
    if (!this.board.b[sq+1])  wkz[sq+1]=1;
  
    if (!this.board.b[sq-11]) wkz[sq-11]=1;
    if (!this.board.b[sq-12]) wkz[sq-12]=1;
    if (!this.board.b[sq-13]) wkz[sq-13]=1;
  
    if (!this.board.b[sq-23]) wkz[sq-23]=1;
    if (!this.board.b[sq-24]) wkz[sq-24]=1;
    if (!this.board.b[sq-25]) wkz[sq-25]=1;
  
  // B
  
    if (!this.board.b[sq-13]) bkz[sq-13]=1;
    if (!this.board.b[sq-12]) bkz[sq-12]=1;
    if (!this.board.b[sq-11]) bkz[sq-11]=1;
  
    if (!this.board.b[sq-1])  bkz[sq-1]=1;
    if (!this.board.b[sq+0])  bkz[sq+0]=1;
    if (!this.board.b[sq+1])  bkz[sq+1]=1;
  
    if (!this.board.b[sq+11]) bkz[sq+11]=1;
    if (!this.board.b[sq+12]) bkz[sq+12]=1;
    if (!this.board.b[sq+13]) bkz[sq+13]=1;
  
    if (!this.board.b[sq+23]) bkz[sq+23]=1;
    if (!this.board.b[sq+24]) bkz[sq+24]=1;
    if (!this.board.b[sq+25]) bkz[sq+25]=1;
  }
  
  //}}}
  //{{{  init DIST
  
  for (var i=0; i < 144; i++) {
    DIST[i]   = Array(144);
    var rankI = RANK[i];
    var fileI = FILE[i];
    for (var j=0; j < 144; j++) {
      var rankJ = RANK[j];
      var fileJ = FILE[j];
      DIST[i][j] = Math.max(Math.abs(rankI-rankJ),Math.abs(fileI-fileJ));
    }
  }
  
  //}}}

  return this;
}

//}}}
//{{{  .init

lozChess.prototype.init = function () {

  for (var i=0; i < this.nodes.length; i++)
    this.nodes[i].init();

  this.board.init();
  this.stats.init();
}

//}}}
//{{{  .newGameInit

lozChess.prototype.newGameInit = function () {

  this.board.ttInit();
  this.uci.numMoves = 0;
}

//}}}
//{{{  .position

lozChess.prototype.position = function () {

  this.init();
  return this.board.position();
}

//}}}
//{{{  .go

lozChess.prototype.go = function() {

  this.stats.init();
  this.stats.update();

  var board = this.board;
  var spec  = this.uci.spec;

  //{{{  sort out spec
  
  this.uci.send('info hashfull',Math.round(1000*board.hashUsed/TTSIZE));
  
  var totTime = 0;
  var movTime = 0;
  var incTime = 0;
  
  if (spec.depth <= 0)
    spec.depth = MAX_PLY;
  
  if (spec.moveTime > 0)
    this.stats.moveTime = spec.moveTime;
  
  if (spec.maxNodes > 0)
    this.stats.maxNodes = spec.maxNodes;
  
  if (spec.moveTime == 0) {
  
    if (spec.movesToGo > 0)
      var movesToGo = spec.movesToGo + 2;
    else
      var movesToGo = 30;
  
    if (board.turn == WHITE) {
      totTime = spec.wTime;
      incTime = spec.wInc;
    }
    else {
      totTime = spec.bTime;
      incTime = spec.bInc;
    }
  
    //totTime = Math.round(totTime * (movesToGo - 1) / movesToGo);
    movTime = Math.round(totTime / movesToGo) + incTime;
  
    //if (this.uci.numMoves <= 3) {
      //movTime *= 2;
    //}
  
    if (movTime > 0)
      this.stats.moveTime = movTime | 0;
  
    if (this.stats.moveTime < 10 && (spec.wTime || spec.bTime))
      this.stats.moveTime = 10;
  }
  
  //}}}

  var alpha       = -INFINITY;
  var beta        = INFINITY;
  var asp         = ASP_MAX;
  var ply         = 1;
  var maxPly      = spec.depth;
  var bestMoveStr = '';
  var score       = 0;

  while (ply <= maxPly) {

    this.stats.ply = ply;

    score = this.search(this.rootNode, ply, board.turn, alpha, beta);

    if (this.stats.timeOut) {
      break;
    }

    if (score <= alpha || score >= beta) {
      //{{{  research
      
      if (score >= beta) {
        this.uci.debug('BETA', ply, score, '>=', beta);
      }
      else {
        this.uci.debug('ALPHA', ply, score, '<=', alpha);
        if (totTime > 30000) {
          movTime              = movTime / 2 | 0;
          this.stats.moveTime += movTime;
        }
      }
      
      alpha = -INFINITY;
      beta  = INFINITY;
      asp   = ASP_MAX * 10;
      
      continue;
      
      //}}}
    }

    if (Math.abs(score) >= MINMATE && Math.abs(score) <= MATE) {
      break;
    }

    alpha = score - asp;
    beta  = score + asp;

    asp -= ASP_DELTA;       //  shrink the window.
    if (asp < ASP_MIN)
      asp = ASP_MIN;

    ply += 1;
  }

  this.stats.update();
  this.stats.stop();

  bestMoveStr = board.formatMove(this.stats.bestMove,UCI_FMT);

  board.makeMove(this.rootNode,this.stats.bestMove);

  this.uci.send('bestmove',bestMoveStr);

  //this.uci.debug(board.initNumWhitePieces,board.initNumWhitePawns,board.initNumBlackPieces,board.initNumBlackPawns);
  this.uci.debug(spec.board + ' ' + spec.turn + ' ' + spec.rights + ' ' + spec.ep);
  this.uci.debug(BUILD + ' ' + spec.depth+'p','|',this.stats.nodesMega+'Mn','|',this.stats.nodes+'n','|',this.stats.timeSec+'s','|',bestMoveStr,'|',board.formatMove(this.stats.bestMove,SAN_FMT));
}

//}}}
//{{{  .search

lozChess.prototype.search = function (node, depth, turn, alpha, beta) {

  //{{{  housekeeping
  
  if (!node.childNode) {
    this.uci.debug('S DEPTH');
    this.stats.timeOut = 1;
    return;
  }
  
  //}}}

  var board          = this.board;
  var nextTurn       = ~turn & COLOR_MASK;
  var oAlpha         = alpha;
  var numLegalMoves  = 0;
  var numSlides      = 0;
  var move           = 0;
  var bestMove       = 0;
  var score          = 0;
  var bestScore      = -INFINITY;
  var inCheck        = board.isKingAttacked(nextTurn);
  var R              = 0;
  var E              = 0;
  var givesCheck     = INCHECK_UNKNOWN;
  var keeper         = false;
  var doLMR          = depth >= 3;

  node.cache();

  board.ttGet(node, depth, alpha, beta);  // load hash move.

  if (inCheck)
    board.genEvasions(node, turn);
  else
    board.genMoves(node, turn);

  if (this.stats.timeOut)
    return;

  while (move = node.getNextMove()) {

    board.makeMove(node,move);

    //{{{  legal?
    
    if (board.isKingAttacked(nextTurn)) {
    
      board.unmakeMove(node,move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    numLegalMoves++;
    if (node.base < BASE_LMR)
      numSlides++;

    //{{{  send current move to UCI
    
    if (this.stats.splits > 3)
      this.uci.send('info currmove ' + board.formatMove(move,SAN_FMT) + ' currmovenumber ' + numLegalMoves);
    
    //}}}

    //{{{  extend/reduce
    
    givesCheck = INCHECK_UNKNOWN;
    E          = 0;
    R          = 0;
    
    if (inCheck) {
      E = 1;
    }
    
    else if (doLMR) {
    
      givesCheck = board.isKingAttacked(turn);
      keeper     = node.base >= BASE_LMR || (move & KEEPER_MASK) || givesCheck || board.alphaMate(alpha);
    
      if (!keeper && numSlides > 4) {
        R = 1 + depth/5 + numSlides/20 | 0;
      }
    }
    
    //}}}

    if (numLegalMoves == 1) {
      score = -this.alphabeta(node.childNode, depth+E-1, nextTurn, -beta, -alpha, NULL_Y, givesCheck);
    }
    else {
      score = -this.alphabeta(node.childNode, depth+E-R-1, nextTurn, -alpha-1, -alpha, NULL_Y, givesCheck);
      if (!this.stats.timeOut && score > alpha) {
        score = -this.alphabeta(node.childNode, depth+E-1, nextTurn, -beta, -alpha, NULL_Y, givesCheck);
      }
    }

    //{{{  unmake move
    
    board.unmakeMove(node,move);
    
    node.uncache();
    
    //}}}

    if (this.stats.timeOut) {
      return;
    }

    if (score > bestScore) {
      if (score > alpha) {
        if (score >= beta) {
          node.addKiller(score, move);
          board.ttPut(TT_BETA, depth, score, move, node.ply, alpha, beta);
          board.addHistory(depth, move);
          return score;
        }
        alpha = score;
        //board.ttPut(TT_ALPHA, depth, score, move, node.ply, alpha, beta);
        board.addHistory(depth, move);
        //{{{  update best move & send score to UI
        
        this.stats.bestMove = move;
        
        var absScore = Math.abs(score);
        var units    = 'cp';
        var uciScore = score;
        var mv       = board.formatMove(move,board.mvFmt);
        var pvStr    = board.getPVStr(node,move,depth);
        
        if (absScore >= MINMATE && absScore <= MATE) {
          pvStr += '#';
          var units    = 'mate';
          var uciScore = (MATE - absScore) / 2 | 0;
          if (score < 0)
            uciScore = -uciScore;
        }
        
        this.uci.send('info',this.stats.nodeStr(),'depth',this.stats.ply,'seldepth',this.stats.selDepth,'score',units,uciScore,'pv',pvStr);
        this.stats.update();
        
        //if (!board.ttGetMove(node))
          //this.uci.debug('TT AWOL FOR',mv);
        
        //if (!pvStr)
          //this.uci.debug('NULL PV FOR',mv);
        
        //if (pvStr.indexOf(mv) != 0)
          //this.uci.debug('WRONG PV FOR',mv);
        
        if (this.stats.splits > 5)
          this.uci.send('info hashfull',Math.round(1000*board.hashUsed/TTSIZE));
        
        //}}}
      }
      bestScore = score;
      bestMove  = move;
    }
  }

  if (numLegalMoves == 0)
    this.uci.debug('INVALID');

  if (numLegalMoves == 1)
    this.stats.timeOut = 1;  // only one legal move so don't waste any more time.

  if (bestScore > oAlpha) {
    board.ttPut(TT_EXACT, depth, bestScore, bestMove, node.ply, alpha, beta);
    return bestScore;
  }
  else {
    board.ttPut(TT_ALPHA, depth, oAlpha,    bestMove, node.ply, alpha, beta);
    return oAlpha;
  }
}

//}}}
//{{{  .alphabeta

lozChess.prototype.alphabeta = function (node, depth, turn, alpha, beta, nullOK, inCheck) {

  //{{{  housekeeping
  
  if (!node.childNode) {
    this.uci.debug('AB DEPTH');
    this.stats.timeOut = 1;
  }
  
  if (depth > 2 || this.stats.timeOut) {
    this.stats.lazyUpdate();
    if (this.stats.timeOut)
      return;
  }
  
  if (node.ply > this.stats.selDepth)
    this.stats.selDepth = node.ply;
  
  //}}}

  var board    = this.board;
  var nextTurn = ~turn & COLOR_MASK;
  var score    = 0;
  var pvNode   = beta != (alpha + 1);

  //{{{  check for draws
  
  if (board.repHi - board.repLo > 100)
    return CONTEMPT;
  
  for (var i=board.repHi-5; i >= board.repLo; i -= 2) {
  
    if (board.repLoHash[i] == board.loHash && board.repHiHash[i] == board.hiHash)
      return CONTEMPT;
  }
  
  //}}}
  //{{{  mate distance pruning
  
  var matingValue = MATE - node.ply;
  
  if (matingValue < beta) {
     beta = matingValue;
     if (alpha >= matingValue)
       return matingValue;
  }
  
  var matingValue = -MATE + node.ply;
  
  if (matingValue > alpha) {
     alpha = matingValue;
     if (beta <= matingValue)
       return matingValue;
  }
  
  //}}}
  //{{{  horizon
  
  if (depth <= 0) {
  
    score = board.ttGet(node, 0, alpha, beta);
  
    if (score != TTSCORE_UNKNOWN)
      return score;
  
    score = this.qSearch(node, -1, turn, alpha, beta);
  
    return score;
  }
  
  //}}}
  //{{{  try tt
  
  score = board.ttGet(node, depth, alpha, beta);  // sets/clears node.hashMove.
  
  if (score != TTSCORE_UNKNOWN) {
    return score;
  }
  
  //}}}

  if (inCheck == INCHECK_UNKNOWN)
    inCheck  = board.isKingAttacked(nextTurn);

  var R         = 0;
  var E         = 0;
  var lonePawns = (turn == WHITE && board.wCount == board.wCounts[PAWN]+1) || (turn == BLACK && board.bCount == board.bCounts[PAWN]+1);
  var standPat  = board.evaluate(turn);
  var gPhase    = board.gPhase;
  var doBeta    = !pvNode && !inCheck && !lonePawns && nullOK == NULL_Y && !board.betaMate(beta);

  //{{{  prune?
  
  if (doBeta && depth <= 2 && (standPat - depth * 200) >= beta) {
    return beta;
  }
  
  //}}}

  node.cache();

  //{{{  try null move
  //
  //  Use childNode to make sure killers are aligned.
  //
  
  R = 3;
  
  if (doBeta && depth > 2 && standPat > beta) {
  
    board.loHash ^= board.loEP[board.ep];
    board.hiHash ^= board.hiEP[board.ep];
  
    board.ep = 0; // what else?
  
    board.loHash ^= board.loEP[board.ep];
    board.hiHash ^= board.hiEP[board.ep];
  
    board.loHash ^= board.loTurn;
    board.hiHash ^= board.hiTurn;
  
    score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -beta, -beta+1, NULL_N, INCHECK_UNKNOWN);
  
    node.uncache();
  
    if (this.stats.timeOut)
      return;
  
    if (score >= beta) {
      if (board.betaMate(score))
        score = beta;
      return score;
    }
  
    if (this.stats.timeOut)
      return;
  }
  
  R = 0;
  
  //}}}

  var bestScore      = -INFINITY;
  var move           = 0;
  var bestMove       = 0;
  var oAlpha         = alpha;
  var numLegalMoves  = 0;
  var numSlides      = 0;
  var givesCheck     = INCHECK_UNKNOWN;
  var keeper         = false;
  var doFutility     = !inCheck && depth <= 4 && (standPat + depth * 120) < alpha && !lonePawns;
  var doLMR          = !inCheck && depth >= 3;
  var doLMP          = !inCheck && depth <= 2 && !lonePawns;
  var doIID          = !node.hashMove && pvNode && depth > 3;

  //{{{  IID
  //
  //  If there is no hash move after IID it means that the search returned
  //  a mate or draw score and we could return immediately I think, because
  //  the subsequent search is presumably going to find the same.  However
  //  it's a small optimisation and I'm not totally convinced.  Needs to be
  //  tested.
  //
  //  Use this node so the killers align.  Should be safe.
  //
  
  if (doIID) {
  
    this.alphabeta(node, depth-2, turn, alpha, beta, NULL_N, inCheck);
    board.ttGet(node, 0, alpha, beta);
  }
  
  if (this.stats.timeOut)
    return;
  
  //}}}

  if (inCheck)
    board.genEvasions(node, turn);
  else
    board.genMoves(node, turn);

  if (this.stats.timeOut)
    return;

  while (move = node.getNextMove()) {

    board.makeMove(node,move);

    //{{{  legal?
    
    if (board.isKingAttacked(nextTurn)) {
    
      board.unmakeMove(node,move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    numLegalMoves++;
    if (node.base < BASE_LMR) {
      numSlides++;
    }

    //{{{  extend/reduce/prune
    
    givesCheck = INCHECK_UNKNOWN;
    E          = 0;
    R          = 0;
    
    if (inCheck && depth < 5) {
      E = 1;
    }
    
    else if (doLMP || doLMR || doFutility) {
    
      givesCheck = board.isKingAttacked(turn);
      keeper     = node.base >= BASE_LMR || (move & KEEPER_MASK) || givesCheck || board.alphaMate(alpha);
    
      if (doLMP && !keeper && numSlides > depth*5) {
    
        board.unmakeMove(node,move);
        node.uncache();
        continue;
      }
    
      if (doFutility && !keeper && numLegalMoves > 1) {
    
        board.unmakeMove(node,move);
        node.uncache();
        continue;
      }
    
      if (doLMR && !keeper && numSlides > 4) {
        R = 1 + depth/5 + numSlides/20 | 0;
      }
    }
    
    //}}}

    if (pvNode) {
      if (numLegalMoves == 1)
        score = -this.alphabeta(node.childNode, depth+E-1, nextTurn, -beta, -alpha, NULL_Y, givesCheck);
      else {
        score = -this.alphabeta(node.childNode, depth+E-R-1, nextTurn, -alpha-1, -alpha, NULL_Y, givesCheck);
        if (!this.stats.timeOut && score > alpha) {
          score = -this.alphabeta(node.childNode, depth+E-1, nextTurn, -beta, -alpha, NULL_Y, givesCheck);
        }
      }
    }
    else {
      score = -this.alphabeta(node.childNode, depth+E-R-1, nextTurn, -beta, -alpha, NULL_Y, givesCheck);  // ZW by implication.
      if (R && !this.stats.timeOut && score > alpha)
        score = -this.alphabeta(node.childNode, depth+E-1, nextTurn, -beta, -alpha, NULL_Y, givesCheck);
    }

    //{{{  unmake move
    
    board.unmakeMove(node,move);
    
    node.uncache();
    
    //}}}

    if (this.stats.timeOut)
      return;

    if (score > bestScore) {
      if (score > alpha) {
        if (score >= beta) {
          node.addKiller(score, move);
          board.ttPut(TT_BETA, depth, score, move, node.ply, alpha, beta);
          board.addHistory(depth, move);
          return score;
        }
        //board.ttPut(TT_ALPHA, depth, score, move, node.ply, alpha, beta);
        board.addHistory(depth, move);
        alpha     = score;
      }
      bestScore = score;
      bestMove  = move;
    }
  }

  //{{{  no moves?
  
  if (numLegalMoves == 0) {
  
    if (inCheck) {
      board.ttPut(TT_EXACT, depth, -MATE + node.ply, 0, node.ply, alpha, beta);
      return -MATE + node.ply;
    }
  
    else {
      board.ttPut(TT_EXACT, depth, CONTEMPT, 0, node.ply, alpha, beta);
      return CONTEMPT;
    }
  }
  
  //}}}

  if (bestScore > oAlpha) {
    board.ttPut(TT_EXACT, depth, bestScore, bestMove, node.ply, alpha, beta);
    return bestScore;
  }
  else {
    board.ttPut(TT_ALPHA, depth, oAlpha,    bestMove, node.ply, alpha, beta);
    return oAlpha;
  }
}

//}}}
//{{{  .quiescence

lozChess.prototype.qSearch = function (node, depth, turn, alpha, beta) {

  var board         = this.board;
  var standPat      = board.evaluate(turn);
  var gPhase        = board.gPhase;
  var numLegalMoves = 0;
  var nextTurn      = ~turn & COLOR_MASK;
  var move          = 0;

  //{{{  housekeeping
  
  if (!node.childNode) {
    this.uci.debug('Q DEPTH');
    return standPat;
  }
  
  if (node.ply > this.stats.selDepth)
    this.stats.selDepth = node.ply;
  
  //}}}

  if (depth > -2)
    var inCheck = board.isKingAttacked(nextTurn);
  else
    var inCheck = 0;

  if (!inCheck && standPat >= beta) {
    return standPat;
  }

  if (!inCheck && standPat > alpha)
    alpha = standPat;

  node.cache();

  if (inCheck)
    board.genEvasions(node, turn);
  else
    board.genQMoves(node, turn);

  while (move = node.getNextMove()) {

    board.makeMove(node,move);

    //{{{  legal?
    
    if (board.isKingAttacked(nextTurn)) {
    
      board.unmakeMove(node,move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    numLegalMoves++;

    //{{{  futile?
    
    if (!inCheck && gPhase <= EPHASE && !(move & MOVE_PROMOTE_MASK) && standPat + 200 + VALUE_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK] < alpha) {
    
      board.unmakeMove(node,move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    var score = -this.qSearch(node.childNode, depth-1, nextTurn, -beta, -alpha);

    //{{{  unmake move
    
    board.unmakeMove(node,move);
    
    node.uncache();
    
    //}}}

    if (score > alpha) {
      if (score >= beta) {
        return score;
      }
      alpha = score;
    }
  }

  //{{{  no moves?
  
  if (inCheck && numLegalMoves == 0) {
  
     return -MATE + node.ply;
  }
  
  //}}}

  return alpha;
}

//}}}
//{{{  .perft

lozChess.prototype.perft = function () {

  var spec = this.uci.spec;

  this.stats.ply = spec.depth;

  var moves = this.perftSearch(this.rootNode, spec.depth, this.board.turn, spec.inner);

  this.stats.update();

  var error = moves - spec.moves;

  if (error == 0)
    var err = '';
  else
    var err = 'ERROR ' + error;

  this.uci.send('info string',spec.id,spec.depth,moves,spec.moves,err,this.board.fen());
}

//}}}
//{{{  .perftSearch

lozChess.prototype.perftSearch = function (node, depth, turn, inner) {

  if (depth == 0)
    return 1;

  var board         = this.board;
  var numNodes      = 0;
  var totalNodes    = 0;
  var move          = 0;
  var nextTurn      = ~turn & COLOR_MASK;
  var numLegalMoves = 0;
  var inCheck       = board.isKingAttacked(nextTurn);

  node.cache();

  if (inCheck)
    board.genEvasions(node, turn);
  else
    board.genMoves(node, turn);

  while (move = node.getNextMove()) {

    board.makeMove(node,move);

    //{{{  legal?
    
    if (board.isKingAttacked(nextTurn)) {
    
      board.unmakeMove(node,move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    numLegalMoves++;

    var numNodes = this.perftSearch(node.childNode, depth-1, nextTurn);

    totalNodes += numNodes;

    //{{{  unmake move
    
    board.unmakeMove(node,move);
    
    node.uncache();
    
    //}}}

    if (node.root) {
      var fmove = board.formatMove(move,SAN_FMT);
      this.uci.send('info currmove ' + fmove + ' currmovenumber ' + numLegalMoves);
      if (inner)
        this.uci.send('info string',fmove,numNodes);
    }
  }

  if (depth > 2)
    this.stats.lazyUpdate();

  return totalNodes;
}

//}}}

//}}}
//{{{  lozBoard class

//{{{  lozBoard

const TTSIZE = 1 << 24;
const TTMASK = TTSIZE - 1;

const PTTSIZE = 1 << 14;
const PTTMASK = PTTSIZE - 1;

function lozBoard () {

  this.initNumWhitePieces = 0;
  this.initNumBlackPieces = 0;

  this.initNumWhitePawns  = 0;
  this.initNumBlackPawns  = 0;

  this.lozza        = null;
  this.verbose      = false;
  this.mvFmt        = 0;
  this.hashUsed     = 0;

  this.b = new Uint16Array(144);    // pieces.
  this.z = new Uint16Array(144);    // indexes to w|bList.

  this.wList = new Uint16Array(16); // list of squares with white pieces.
  this.bList = new Uint16Array(16); // list of squares with black pieces.

  this.firstBP = 0;
  this.firstWP = 0;

  this.runningEvalS = 0;  // these are all cached across make/unmakeMove.
  this.runningEvalE = 0;
  this.rights       = 0;
  this.ep           = 0;
  this.repLo        = 0;
  this.repHi        = 0;
  this.loHash       = 0;
  this.hiHash       = 0;
  this.ploHash      = 0;
  this.phiHash      = 0;

  // use separate typed arrays to save space.  optimiser probably has a go anyway but better
  // to be explicit at the expense of some conversion.  total width is 16 bytes.

  this.ttLo      = new Int32Array(TTSIZE);
  this.ttHi      = new Int32Array(TTSIZE);
  this.ttType    = new Uint8Array(TTSIZE);
  this.ttDepth   = new Int8Array(TTSIZE);   // allow -ve depths but currently not used for q.
  this.ttMove    = new Uint32Array(TTSIZE); // see constants for structure.
  this.ttScore   = new Int16Array(TTSIZE);

  this.pttLo     = new Int32Array(PTTSIZE);
  this.pttHi     = new Int32Array(PTTSIZE);
  this.pttFlags  = new Uint8Array(PTTSIZE);
  this.pttScoreS = new Int16Array(PTTSIZE);
  this.pttScoreE = new Int16Array(PTTSIZE);
  this.pttwLeast = new Uint32Array(PTTSIZE);
  this.pttbLeast = new Uint32Array(PTTSIZE);
  this.pttwMost  = new Uint32Array(PTTSIZE);
  this.pttbMost  = new Uint32Array(PTTSIZE);

  this.ttInit();

  this.turn = 0;

  //{{{  Zobrist turn
  
  this.loTurn = this.rand32();
  this.hiTurn = this.rand32();
  
  //}}}
  //{{{  Zobrist pieces
  
  this.loPieces = Array(2);
  for (var i=0; i < 2; i++) {
    this.loPieces[i] = Array(6);
    for (var j=0; j < 6; j++) {
      this.loPieces[i][j] = new Array(144);
      for (var k=0; k < 144; k++)
        this.loPieces[i][j][k] = this.rand32();
    }
  }
  
  this.hiPieces = Array(2);
  for (var i=0; i < 2; i++) {
    this.hiPieces[i] = Array(6);
    for (var j=0; j < 6; j++) {
      this.hiPieces[i][j] = new Array(144);
      for (var k=0; k < 144; k++)
        this.hiPieces[i][j][k] = this.rand32();
    }
  }
  
  //}}}
  //{{{  Zobrist rights
  
  this.loRights = new Array(16);
  this.hiRights = new Array(16);
  
  for (var i=0; i < 16; i++) {
    this.loRights[i] = this.rand32();
    this.hiRights[i] = this.rand32();
  }
  
  //}}}
  //{{{  Zobrist EP
  
  this.loEP = new Array(144);
  this.hiEP = new Array(144);
  
  for (var i=0; i < 144; i++) {
    this.loEP[i] = this.rand32();
    this.hiEP[i] = this.rand32();
  }
  
  //}}}

  this.repLoHash = new Array(1000);
  for (var i=0; i < 1000; i++)
    this.repLoHash[i] = 0;

  this.repHiHash = new Array(1000);
  for (var i=0; i < 1000; i++)
    this.repHiHash[i] = 0;

  this.phase  = TPHASE;
  this.gPhase = 0;

  this.wCounts = new Uint16Array(7);
  this.bCounts = new Uint16Array(7);

  this.wCount  = 0;
  this.bCount  = 0;

  this.wHistory = Array(7)
  for (var i=0; i < 7; i++) {
    this.wHistory[i] = Array(144);
    for (var j=0; j < 144; j++)
      this.wHistory[i][j] = 0;
  }

  this.bHistory = Array(7)
  for (var i=0; i < 7; i++) {
    this.bHistory[i] = Array(144);
    for (var j=0; j < 144; j++)
      this.bHistory[i][j] = 0;
  }
}

//}}}
//{{{  .init

lozBoard.prototype.init = function () {

  this.initNumWhitePieces = 0;
  this.initNumBlackPieces = 0;

  this.initNumWhitePawns  = 0;
  this.initNumBlackPawns  = 0;

  for (var i=0; i < this.b.length; i++)
    this.b[i] = EDGE;

  for (var i=0; i < B88.length; i++)
    this.b[B88[i]] = NULL;

  for (var i=0; i < this.z.length; i++)
    this.z[i] = NO_Z;

  this.loHash = 0;
  this.hiHash = 0;

  this.ploHash = 0;
  this.phiHash = 0;

  this.repLo = 0;
  this.repHi = 0;

  this.phase  = TPHASE;
  this.gPhase = 0;

  for (var i=0; i < this.wCounts.length; i++)
    this.wCounts[i] = 0;

  for (var i=0; i < this.bCounts.length; i++)
    this.bCounts[i] = 0;

  this.wCount = 0;
  this.bCount = 0;

  for (var i=0; i < this.wList.length; i++)
    this.wList[i] = EMPTY;

  for (var i=0; i < this.bList.length; i++)
    this.bList[i] = EMPTY;

  this.firstBP = 0;
  this.firstWP = 0;

  if (lozzaHost == HOST_WEB)
    this.mvFmt = SAN_FMT;
  else
    this.mvFmt = UCI_FMT;
}

//}}}
//{{{  .position

lozBoard.prototype.position = function () {

  var spec = lozza.uci.spec;

  this.initNumWhitePieces = 0;
  this.initNumBlackPieces = 0;

  this.initNumWhitePawns  = 0;
  this.initNumBlackPawns  = 0;

  //{{{  board turn
  
  if (spec.turn == 'w')
    this.turn = WHITE;
  
  else {
    this.turn = BLACK;
    this.loHash ^= this.loTurn;
    this.hiHash ^= this.hiTurn;
  }
  
  //}}}
  //{{{  board rights
  
  this.rights = 0;
  
  for (var i=0; i < spec.rights.length; i++) {
  
    var ch = spec.rights.charAt(i);
  
    if (ch == 'K') this.rights |= WHITE_RIGHTS_KING;
    if (ch == 'Q') this.rights |= WHITE_RIGHTS_QUEEN;
    if (ch == 'k') this.rights |= BLACK_RIGHTS_KING;
    if (ch == 'q') this.rights |= BLACK_RIGHTS_QUEEN;
  }
  
  this.loHash ^= this.loRights[this.rights];
  this.hiHash ^= this.hiRights[this.rights];
  
  //}}}
  //{{{  board board
  
  this.phase = TPHASE;
  
  var sq = 0;
  var nw = 0;
  var nb = 0;
  
  for (var j=0; j < spec.board.length; j++) {
  
    var ch  = spec.board.charAt(j);
    var chn = parseInt(ch);
  
    while (this.b[sq] == EDGE)
      sq++;
  
    if (isNaN(chn)) {
  
      if (ch != '/') {
  
        var obj   = MAP[ch];
        var piece = obj & PIECE_MASK;
        var col   = obj & COLOR_MASK;
  
        if (col == WHITE) {
          this.wList[nw] = sq;
          this.b[sq]     = obj;
          this.z[sq]     = nw;
          nw++;
          this.wCounts[piece]++;
          this.wCount++;
        }
  
        else {
          this.bList[nb] = sq;
          this.b[sq]     = obj;
          this.z[sq]     = nb;
          nb++;
          this.bCounts[piece]++;
          this.bCount++;
        }
  
        this.loHash ^= this.loPieces[col>>>3][piece-1][sq];
        this.hiHash ^= this.hiPieces[col>>>3][piece-1][sq];
  
        if (piece == PAWN) {
          this.ploHash ^= this.loPieces[col>>>3][0][sq];
          this.phiHash ^= this.hiPieces[col>>>3][0][sq];
        }
  
        this.phase -= VPHASE[piece];
  
        sq++;
      }
    }
  
    else {
  
      for (var k=0; k < chn; k++) {
        this.b[sq] = NULL;
        sq++;
      }
    }
  }
  
  //}}}
  //{{{  board ep
  
  if (spec.ep.length == 2)
    this.ep = COORDS.indexOf(spec.ep)
  else
    this.ep = 0;
  
  this.loHash ^= this.loEP[this.ep];
  this.hiHash ^= this.hiEP[this.ep];
  
  //}}}

  //{{{  init running evals
  
  this.runningEvalS = 0;
  this.runningEvalE = 0;
  
  var next  = 0;
  var count = 0;
  
  while (count < this.wCount) {
  
    sq = this.wList[next];
  
    if (!sq) {
      next++;
      continue;
    }
  
    var piece = this.b[sq] & PIECE_MASK;
  
    this.runningEvalS += VALUE_VECTOR[piece];
    this.runningEvalS += WS_PST[piece][sq];
    this.runningEvalE += VALUE_VECTOR[piece];
    this.runningEvalE += WE_PST[piece][sq];
  
    count++;
    next++
  }
  
  var next  = 0;
  var count = 0;
  
  while (count < this.bCount) {
  
    sq = this.bList[next];
  
    if (!sq) {
      next++;
      continue;
    }
  
    var piece = this.b[sq] & PIECE_MASK;
  
    this.runningEvalS -= VALUE_VECTOR[piece];
    this.runningEvalS -= BS_PST[piece][sq];
    this.runningEvalE -= VALUE_VECTOR[piece];
    this.runningEvalE -= BE_PST[piece][sq];
  
    count++;
    next++
  }
  
  
  //}}}

  this.compact();

  for (var i=0; i < spec.moves.length; i++) {
    if (!this.playMove(spec.moves[i]))
      return 0;
  }

  this.initNumWhitePawns  = this.wCounts[PAWN];
  this.initNumWhitePieces = this.wCount - this.initNumWhitePawns;

  this.initNumBlackPawns  = this.bCounts[PAWN];
  this.initNumBlackPieces = this.bCount - this.initNumBlackPawns;

  this.compact();

  for (var i=0; i < 7; i++) {
    for (var j=0; j < 144; j++)
      this.wHistory[i][j] = 0;
  }

  for (var i=0; i < 7; i++) {
    for (var j=0; j < 144; j++)
      this.bHistory[i][j] = 0;
  }

  return 1;
}

//}}}
//{{{  .compact

lozBoard.prototype.compact = function () {

  //{{{  compact white list
  
  var v = [];
  
  for (var i=0; i<16; i++) {
    if (this.wList[i])
      v.push(this.wList[i]);
  }
  
  v.sort(function(a,b) {
    return lozza.board.b[b] - lozza.board.b[a];
  });
  
  for (var i=0; i<16; i++) {
    if (i < v.length) {
      this.wList[i] = v[i];
      this.z[v[i]]  = i;
    }
    else
      this.wList[i] = EMPTY;
  }
  
  this.firstWP = 0;
  for (var i=0; i<16; i++) {
    if (this.b[this.wList[i]] == W_PAWN) {
      this.firstWP = i;
      break;
    }
  }
  
  /*
  console.log('WHITE LIST ' + v.length);
  for (var i=0; i<this.wCount; i++) {
    console.log(this.b[this.wList[i]]);
  }
  */
  
  if (this.b[this.wList[0]] != W_KING)
    console.log('WHITE INDEX ERR');
  
  //}}}
  //{{{  compact black list
  
  var v = [];
  
  for (var i=0; i<16; i++) {
    if (this.bList[i])
      v.push(this.bList[i]);
  }
  
  v.sort(function(a,b) {
    return lozza.board.b[b] - lozza.board.b[a];
  });
  
  for (var i=0; i<16; i++) {
    if (i < v.length) {
      this.bList[i] = v[i];
      this.z[v[i]]  = i;
    }
    else
      this.bList[i] = EMPTY;
  }
  
  this.firstBP = 0;
  for (var i=0; i<16; i++) {
    if (this.b[this.bList[i]] == B_PAWN) {
      this.firstBP = i;
      break;
    }
  }
  
  /*
  console.log('BLACK LIST ' + v.length);
  for (var i=0; i<this.bCount; i++) {
    console.log(this.b[this.bList[i]]);
  }
  */
  
  if (this.b[this.bList[0]] != B_KING)
    console.log('BLACK INDEX ERR');
  
  //}}}
}

//}}}
//{{{  .genMoves

lozBoard.prototype.genMoves = function(node, turn) {

  node.numMoves    = 0;
  node.sortedIndex = 0;

  var b = this.b;

  //{{{  colour based stuff
  
  if (turn == WHITE) {
  
    var pOffsetOrth  = WP_OFFSET_ORTH;
    var pOffsetDiag1 = WP_OFFSET_DIAG1;
    var pOffsetDiag2 = WP_OFFSET_DIAG2;
    var pHomeRank    = 2;
    var pPromoteRank = 7;
    var rights       = this.rights & WHITE_RIGHTS;
    var pList        = this.wList;
    var pCount       = this.wCount;
    var CAPTURE      = IS_B;
  
    if (rights) {
  
      if ((rights & WHITE_RIGHTS_KING)  && b[F1] == NULL && b[G1] == NULL                  && !this.isAttacked(F1,BLACK) && !this.isAttacked(E1,BLACK))
        node.addCastle(MOVE_E1G1);
  
      if ((rights & WHITE_RIGHTS_QUEEN) && b[B1] == NULL && b[C1] == NULL && b[D1] == NULL && !this.isAttacked(D1,BLACK) && !this.isAttacked(E1,BLACK))
        node.addCastle(MOVE_E1C1);
    }
  }
  
  else {
  
    var pOffsetOrth  = BP_OFFSET_ORTH;
    var pOffsetDiag1 = BP_OFFSET_DIAG1;
    var pOffsetDiag2 = BP_OFFSET_DIAG2;
    var pHomeRank    = 7;
    var pPromoteRank = 2;
    var rights       = this.rights & BLACK_RIGHTS;
    var pList        = this.bList;
    var pCount       = this.bCount;
    var CAPTURE      = IS_W;
  
    if (rights) {
  
      if ((rights & BLACK_RIGHTS_KING)  && b[F8] == NULL && b[G8] == NULL &&                  !this.isAttacked(F8,WHITE) && !this.isAttacked(E8,WHITE))
        node.addCastle(MOVE_E8G8);
  
      if ((rights & BLACK_RIGHTS_QUEEN) && b[B8] == NULL && b[C8] == NULL && b[D8] == NULL && !this.isAttacked(D8,WHITE) && !this.isAttacked(E8,WHITE))
        node.addCastle(MOVE_E8C8);
    }
  }
  
  //}}}

  var next    = 0;
  var count   = 0;
  var to      = 0;
  var toObj   = 0;
  var fr      = 0;
  var frObj   = 0;
  var frPiece = 0;
  var frMove  = 0;
  var frRank  = 0;

  while (count < pCount) {

    fr = pList[next];
    if (!fr) {
      next++;
      continue;
    }

    frObj   = b[fr];
    frPiece = frObj & PIECE_MASK;
    frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);
    frRank  = RANK[fr];

    if (frPiece == PAWN) {
      //{{{  P
      
      frMove |= MOVE_PAWN_MASK;
      
      to     = fr + pOffsetOrth;
      toObj  = b[to];
      
      if (!toObj) {
      
        if (frRank == pPromoteRank)
          node.addPromotion(frMove | to);
      
        else {
          node.addSlide(frMove | to);
      
          if (frRank == pHomeRank) {
      
            to += pOffsetOrth;
            if (!b[to])
              node.addSlide(frMove | to | MOVE_EPMAKE_MASK);
          }
        }
      }
      
      to    = fr + pOffsetDiag1;
      toObj = b[to];
      
      if (CAPTURE[toObj]) {
      
        if (frRank == pPromoteRank)
          node.addPromotion(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addCapture(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (!toObj && to == this.ep)
        node.addEPTake(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
      to    = fr + pOffsetDiag2;
      toObj = b[to];
      
      if (CAPTURE[toObj]) {
      
        if (frRank == pPromoteRank)
          node.addPromotion(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addCapture(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (!toObj && to == this.ep)
        node.addEPTake(frMove | to);
      
      //}}}
    }

    else if (IS_KN[frObj]) {
      //{{{  KN
      
      var offsets = OFFSETS[frPiece];
      var dir     = 0;
      
      while (dir < 8) {
      
        to    = fr + offsets[dir++];
        toObj = b[to];
      
        if (!toObj)
          node.addSlide(frMove | to);
        else if (CAPTURE[toObj])
          node.addCapture(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      //}}}
    }

    else {
      //{{{  BRQ
      
      var offsets = OFFSETS[frPiece];
      var len     = offsets.length;
      var dir     = 0;
      
      while (dir < len) {
      
        var offset = offsets[dir++];
      
        to     = fr + offset;
        toObj  = b[to];
      
        while (!toObj) {
      
          node.addSlide(frMove | to);
      
          to    += offset;
          toObj = b[to];
        }
      
        if (CAPTURE[toObj])
          node.addCapture(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      //}}}
    }

    next++;
    count++
  }
}

//}}}
//{{{  .genEvasions

lozBoard.prototype.genEvasions = function(node, turn) {

  node.numMoves    = 0;
  node.sortedIndex = 0;

  var b = this.b;

  //{{{  colour based stuff
  
  if (turn == WHITE) {
  
    var pOffsetOrth  = WP_OFFSET_ORTH;
    var pOffsetDiag1 = WP_OFFSET_DIAG1;
    var pOffsetDiag2 = WP_OFFSET_DIAG2;
    var pHomeRank    = 2;
    var pPromoteRank = 8;
    var pList        = this.wList;
    var pCount       = this.wCount;
    var ray          = STARRAY[this.wList[0]];
    var myKing       = W_KING;
  }
  
  else {
  
    var pOffsetOrth  = BP_OFFSET_ORTH;
    var pOffsetDiag1 = BP_OFFSET_DIAG1;
    var pOffsetDiag2 = BP_OFFSET_DIAG2;
    var pHomeRank    = 7;
    var pPromoteRank = 1;
    var pList        = this.bList;
    var pCount       = this.bCount;
    var ray          = STARRAY[this.bList[0]];
    var myKing       = B_KING;
  }
  
  //}}}

  var next  = 0;
  var count = 0;

  while (count < pCount) {

    var fr = pList[next];
    if (!fr) {
      next++;
      continue;
    }

    var frObj   = this.b[fr];
    var frPiece = frObj & PIECE_MASK;
    var frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);
    var rayFrom = ray[fr];

    if (frPiece == PAWN) {
      //{{{  pawn
      
      frMove |= MOVE_PAWN_MASK;
      
      var to        = fr + pOffsetOrth;
      var toObj     = b[to];
      var rayTo     = ray[to];
      var keepSlide = rayTo > 0 && (rayTo != rayFrom) && !CORNERS[to];
      
      if (toObj == NULL) {
      
        if (RANK[to] == pPromoteRank && keepSlide)
          node.addPromotion(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
        else {
          if (keepSlide)
            node.addSlide(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
          if (RANK[fr] == pHomeRank) {
      
            to       += pOffsetOrth;
            toObj     = b[to];
            rayTo     = ray[to];
            keepSlide = rayTo > 0 && (rayTo != rayFrom) && !CORNERS[to];
      
            if (toObj == NULL && keepSlide)
              node.addSlide(frMove | (toObj << MOVE_TOOBJ_BITS) | to | MOVE_EPMAKE_MASK);
          }
        }
      }
      
      var to    = fr + pOffsetDiag1;
      var toObj = b[to];
      var rayTo = ray[to];
      
      if (toObj != NULL && toObj != EDGE && (toObj & COLOR_MASK) != turn && rayTo) {
      
        if (RANK[to] == pPromoteRank)
          node.addPromotion(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addCapture(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (toObj == NULL && to == this.ep && rayTo)
        node.addEPTake(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
      var to    = fr + pOffsetDiag2;
      var toObj = b[to];
      var rayTo = ray[to];
      
      if (toObj != NULL && toObj != EDGE && (toObj & COLOR_MASK) != turn && rayTo) {
      
        if (RANK[to] == pPromoteRank)
          node.addPromotion(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addCapture(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (toObj == NULL && to == this.ep && rayTo)
        node.addEPTake(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
      //}}}
    }

    else {
      //{{{  not a pawn
      
      var offsets = OFFSETS[frPiece];
      var limit   = LIMITS[frPiece];
      
      for (var dir=0; dir < offsets.length; dir++) {
      
        var offset = offsets[dir];
      
        for (var slide=1; slide<=limit; slide++) {
      
          var to    = fr + offset * slide;
          var toObj = b[to];
          var rayTo = ray[to];
      
          if (toObj == NULL) {
            if (frObj == myKing || (rayTo > 0 && (rayTo != rayFrom) && !CORNERS[to]))
              node.addSlide(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
            continue;
          }
      
          if (toObj == EDGE)
            break;
      
          if ((toObj & COLOR_MASK) != turn) {
            if (rayTo)
              node.addCapture(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
          }
      
          break;
        }
      }
      
      //}}}
    }

    next++;
    count++
  }
}

//}}}
//{{{  .genQMoves

lozBoard.prototype.genQMoves = function(node, turn) {

  node.numMoves    = 0;
  node.sortedIndex = 0;

  var b = this.b;

  //{{{  colour based stuff
  
  if (turn == WHITE) {
  
    var pOffsetOrth  = WP_OFFSET_ORTH;
    var pOffsetDiag1 = WP_OFFSET_DIAG1;
    var pOffsetDiag2 = WP_OFFSET_DIAG2;
    var pPromoteRank = 7;
    var pList        = this.wList;
    var pCount       = this.wCount;
    var CAPTURE      = IS_B;
  }
  
  else {
  
    var pOffsetOrth  = BP_OFFSET_ORTH;
    var pOffsetDiag1 = BP_OFFSET_DIAG1;
    var pOffsetDiag2 = BP_OFFSET_DIAG2;
    var pPromoteRank = 2;
    var pList        = this.bList;
    var pCount       = this.bCount;
    var CAPTURE      = IS_W;
  }
  
  //}}}

  var next    = 0;
  var count   = 0;
  var to      = 0;
  var toObj   = 0;
  var fr      = 0;
  var frObj   = 0;
  var frPiece = 0;
  var frMove  = 0;
  var frRank  = 0;

  while (count < pCount) {

    fr = pList[next];
    if (!fr) {
      next++;
      continue;
    }

    frObj   = b[fr];
    frPiece = frObj & PIECE_MASK;
    frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);
    frRank  = RANK[fr];

    if (frPiece == PAWN) {
      //{{{  P
      
      frMove |= MOVE_PAWN_MASK;
      
      to     = fr + pOffsetOrth;
      toObj  = b[to];
      
      if (!toObj) {
      
        if (frRank == pPromoteRank)
          node.addQPromotion(MOVE_PROMOTE_MASK | frMove | to);
      }
      
      to    = fr + pOffsetDiag1;
      toObj = b[to];
      
      if (CAPTURE[toObj]) {
      
        if (frRank == pPromoteRank)
          node.addQPromotion(MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addQMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (!toObj && to == this.ep)
        node.addQMove(MOVE_EPTAKE_MASK | frMove | to);
      
      to    = fr + pOffsetDiag2;
      toObj = b[to];
      
      if (CAPTURE[toObj]) {
      
        if (frRank == pPromoteRank)
          node.addQPromotion(MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addQMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (!toObj && to == this.ep)
        node.addQMove(MOVE_EPTAKE_MASK | frMove | to);
      
      //}}}
    }

    else if (IS_KN[frObj]) {
      //{{{  KN
      
      var offsets = OFFSETS[frPiece];
      var dir     = 0;
      
      while (dir < 8) {
      
        to    = fr + offsets[dir++];
        toObj = b[to];
      
        if (CAPTURE[toObj])
          node.addQMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      //}}}
    }

    else {
      //{{{  BRQ
      
      var offsets = OFFSETS[frPiece];
      var len     = offsets.length;
      var dir     = 0;
      
      while (dir < len) {
      
        var offset = offsets[dir++];
      
        to = fr + offset;
      
        while (!b[to])
          to += offset;
      
        toObj = b[to];
      
        if (CAPTURE[toObj])
          node.addQMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      //}}}
    }

    next++;
    count++
  }
}

//}}}
//{{{  .makeMove

lozBoard.prototype.makeMove = function (node,move) {

  this.lozza.stats.nodes++;

  var b = this.b;
  var z = this.z;

  var fr      = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to      = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj   = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  var frPiece = frObj & PIECE_MASK;
  var frCol   = frObj & COLOR_MASK;
  var frColI  = frCol >>> 3;

  //{{{  slide piece
  
  b[fr] = NULL;
  b[to] = frObj;
  
  node.frZ = z[fr];
  node.toZ = z[to];
  
  z[fr] = NO_Z;
  z[to] = node.frZ;
  
  this.loHash ^= this.loPieces[frColI][frPiece-1][fr];
  this.hiHash ^= this.hiPieces[frColI][frPiece-1][fr];
  
  this.loHash ^= this.loPieces[frColI][frPiece-1][to];
  this.hiHash ^= this.hiPieces[frColI][frPiece-1][to];
  
  if (frPiece == PAWN) {
    this.ploHash ^= this.loPieces[frColI][PAWN-1][fr];
    this.phiHash ^= this.hiPieces[frColI][PAWN-1][fr];
    this.ploHash ^= this.loPieces[frColI][PAWN-1][to];
    this.phiHash ^= this.hiPieces[frColI][PAWN-1][to];
  }
  
  if (frCol == WHITE) {
  
    this.wList[node.frZ] = to;
  
    this.runningEvalS -= WS_PST[frPiece][fr];
    this.runningEvalS += WS_PST[frPiece][to];
    this.runningEvalE -= WE_PST[frPiece][fr];
    this.runningEvalE += WE_PST[frPiece][to];
  }
  
  else {
  
    this.bList[node.frZ] = to;
  
    this.runningEvalS += BS_PST[frPiece][fr];
    this.runningEvalS -= BS_PST[frPiece][to];
    this.runningEvalE += BE_PST[frPiece][fr];
    this.runningEvalE -= BE_PST[frPiece][to];
  }
  
  //}}}
  //{{{  clear rights?
  
  if (this.rights) {
  
    this.loHash ^= this.loRights[this.rights];
    this.hiHash ^= this.hiRights[this.rights];
  
    this.rights &= MASK_RIGHTS[fr] & MASK_RIGHTS[to];
  
    this.loHash ^= this.loRights[this.rights];
    this.hiHash ^= this.hiRights[this.rights];
  }
  
  //}}}
  //{{{  capture?
  
  if (toObj) {
  
    var toPiece = toObj & PIECE_MASK;
    var toCol   = toObj & COLOR_MASK;
    var toColI  = toCol >>> 3;
  
    this.loHash ^= this.loPieces[toColI][toPiece-1][to];
    this.hiHash ^= this.hiPieces[toColI][toPiece-1][to];
  
    if (toPiece == PAWN) {
      this.ploHash ^= this.loPieces[toColI][PAWN-1][to];
      this.phiHash ^= this.hiPieces[toColI][PAWN-1][to];
    }
  
    this.phase += VPHASE[toPiece];
  
    if (toCol == WHITE) {
  
      this.wList[node.toZ] = EMPTY;
  
      this.runningEvalS -= VALUE_VECTOR[toPiece];
      this.runningEvalS -= WS_PST[toPiece][to];
      this.runningEvalE -= VALUE_VECTOR[toPiece];
      this.runningEvalE -= WE_PST[toPiece][to];
  
      this.wCounts[toPiece]--;
      this.wCount--;
    }
  
    else {
  
      this.bList[node.toZ] = EMPTY;
  
      this.runningEvalS += VALUE_VECTOR[toPiece];
      this.runningEvalS += BS_PST[toPiece][to];
      this.runningEvalE += VALUE_VECTOR[toPiece];
      this.runningEvalE += BE_PST[toPiece][to];
  
      this.bCounts[toPiece]--;
      this.bCount--;
    }
  }
  
  //}}}
  //{{{  reset EP
  
  this.loHash ^= this.loEP[this.ep];
  this.hiHash ^= this.hiEP[this.ep];
  
  this.ep = 0;
  
  this.loHash ^= this.loEP[this.ep];
  this.hiHash ^= this.hiEP[this.ep];
  
  //}}}

  if (move & MOVE_SPECIAL_MASK) {
    //{{{  ikky stuff
    
    if (frCol == WHITE) {
    
      var ep = to + 12;
    
      if (move & MOVE_EPMAKE_MASK) {
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
    
        this.ep = ep;
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
      }
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[ep]    = NULL;
        node.epZ = z[ep];
        z[ep]    = NO_Z;
    
        this.bList[node.epZ] = EMPTY;
    
        this.loHash ^= this.loPieces[I_BLACK][PAWN-1][ep];
        this.hiHash ^= this.hiPieces[I_BLACK][PAWN-1][ep];
    
        this.ploHash ^= this.loPieces[I_BLACK][PAWN-1][ep];
        this.phiHash ^= this.hiPieces[I_BLACK][PAWN-1][ep];
    
        this.runningEvalS += VALUE_PAWN;
        this.runningEvalS += BS_PST[PAWN][ep];  // sic.
        this.runningEvalE += VALUE_PAWN;
        this.runningEvalE += BE_PST[PAWN][ep];  // sic.
    
        this.bCounts[PAWN]--;
        this.bCount--;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]   = WHITE | pro;
    
        this.loHash ^= this.loPieces[I_WHITE][PAWN-1][to];
        this.hiHash ^= this.hiPieces[I_WHITE][PAWN-1][to];
        this.loHash ^= this.loPieces[I_WHITE][pro-1][to];
        this.hiHash ^= this.hiPieces[I_WHITE][pro-1][to];
    
        this.ploHash ^= this.loPieces[0][PAWN-1][to];
        this.phiHash ^= this.hiPieces[0][PAWN-1][to];
    
        this.runningEvalS -= VALUE_PAWN;
        this.runningEvalS -= WS_PST[PAWN][to];
        this.runningEvalE -= VALUE_PAWN;
        this.runningEvalE -= WE_PST[PAWN][to];
    
        this.wCounts[PAWN]--;
    
        this.runningEvalS += VALUE_VECTOR[pro];
        this.runningEvalS += WS_PST[pro][to];
        this.runningEvalE += VALUE_VECTOR[pro];
        this.runningEvalE += WE_PST[pro][to];
    
        this.wCounts[pro]++;
    
        this.phase -= VPHASE[pro];
      }
    
      else if (move == MOVE_E1G1) {
    
        b[H1] = NULL;
        b[F1] = W_ROOK;
        z[F1] = z[H1];
        z[H1] = NO_Z;
    
        this.wList[z[F1]] = F1;
    
        this.loHash ^= this.loPieces[I_WHITE][ROOK-1][H1];
        this.hiHash ^= this.hiPieces[I_WHITE][ROOK-1][H1];
        this.loHash ^= this.loPieces[I_WHITE][ROOK-1][F1];
        this.hiHash ^= this.hiPieces[I_WHITE][ROOK-1][F1];
    
        this.runningEvalS -= WS_PST[ROOK][H1];
        this.runningEvalS += WS_PST[ROOK][F1];
        this.runningEvalE -= WE_PST[ROOK][H1];
        this.runningEvalE += WE_PST[ROOK][F1];
      }
    
      else if (move == MOVE_E1C1) {
    
        b[A1] = NULL;
        b[D1] = W_ROOK;
        z[D1] = z[A1];
        z[A1] = NO_Z;
    
        this.wList[z[D1]] = D1;
    
        this.loHash ^= this.loPieces[I_WHITE][ROOK-1][A1];
        this.hiHash ^= this.hiPieces[I_WHITE][ROOK-1][A1];
        this.loHash ^= this.loPieces[I_WHITE][ROOK-1][D1];
        this.hiHash ^= this.hiPieces[I_WHITE][ROOK-1][D1];
    
        this.runningEvalS -= WS_PST[ROOK][A1];
        this.runningEvalS += WS_PST[ROOK][D1];
        this.runningEvalE -= WE_PST[ROOK][A1];
        this.runningEvalE += WE_PST[ROOK][D1];
      }
    }
    
    else {
    
      var ep = to - 12;
    
      if (move & MOVE_EPMAKE_MASK) {
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
    
        this.ep = ep;
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
      }
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[ep]    = NULL;
        node.epZ = z[ep];
        z[ep]    = NO_Z;
    
        this.wList[node.epZ] = EMPTY;
    
        this.loHash ^= this.loPieces[I_WHITE][PAWN-1][ep];
        this.hiHash ^= this.hiPieces[I_WHITE][PAWN-1][ep];
    
        this.ploHash ^= this.loPieces[I_WHITE][PAWN-1][ep];
        this.phiHash ^= this.hiPieces[I_WHITE][PAWN-1][ep];
    
        this.runningEvalS -= VALUE_PAWN;
        this.runningEvalS -= WS_PST[PAWN][ep];  // sic.
        this.runningEvalE -= VALUE_PAWN;
        this.runningEvalE -= WE_PST[PAWN][ep];  // sic.
    
        this.wCounts[PAWN]--;
        this.wCount--;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]   = BLACK | pro;
    
        this.loHash ^= this.loPieces[I_BLACK][PAWN-1][to];
        this.hiHash ^= this.hiPieces[I_BLACK][PAWN-1][to];
        this.loHash ^= this.loPieces[I_BLACK][pro-1][to];
        this.hiHash ^= this.hiPieces[I_BLACK][pro-1][to];
    
        this.ploHash ^= this.loPieces[I_BLACK][PAWN-1][to];
        this.phiHash ^= this.hiPieces[I_BLACK][PAWN-1][to];
    
        this.runningEvalS += VALUE_PAWN;
        this.runningEvalS += BS_PST[PAWN][to];
        this.runningEvalE += VALUE_PAWN;
        this.runningEvalE += BE_PST[PAWN][to];
    
        this.bCounts[PAWN]--;
    
        this.runningEvalS -= VALUE_VECTOR[pro];
        this.runningEvalS -= BS_PST[pro][to];
        this.runningEvalE -= VALUE_VECTOR[pro];
        this.runningEvalE -= BE_PST[pro][to];
    
        this.bCounts[pro]++;
    
        this.phase -= VPHASE[pro];
      }
    
      else if (move == MOVE_E8G8) {
    
        b[H8] = NULL;
        b[F8] = B_ROOK;
        z[F8] = z[H8];
        z[H8] = NO_Z;
    
        this.bList[z[F8]] = F8;
    
        this.loHash ^= this.loPieces[I_BLACK][ROOK-1][H8];
        this.hiHash ^= this.hiPieces[I_BLACK][ROOK-1][H8];
        this.loHash ^= this.loPieces[I_BLACK][ROOK-1][F8];
        this.hiHash ^= this.hiPieces[I_BLACK][ROOK-1][F8];
    
        this.runningEvalS += BS_PST[ROOK][H8];
        this.runningEvalS -= BS_PST[ROOK][F8];
        this.runningEvalE += BE_PST[ROOK][H8];
        this.runningEvalE -= BE_PST[ROOK][F8];
      }
    
      else if (move == MOVE_E8C8) {
    
        b[A8] = NULL;
        b[D8] = B_ROOK;
        z[D8] = z[A8];
        z[A8] = NO_Z;
    
        this.bList[z[D8]] = D8;
    
        this.loHash ^= this.loPieces[I_BLACK][ROOK-1][A8];
        this.hiHash ^= this.hiPieces[I_BLACK][ROOK-1][A8];
        this.loHash ^= this.loPieces[I_BLACK][ROOK-1][D8];
        this.hiHash ^= this.hiPieces[I_BLACK][ROOK-1][D8];
    
        this.runningEvalS += BS_PST[ROOK][A8];
        this.runningEvalS -= BS_PST[ROOK][D8];
        this.runningEvalE += BE_PST[ROOK][A8];
        this.runningEvalE -= BE_PST[ROOK][D8];
      }
    }
    
    //}}}
  }

  //{{{  flip turn in hash
  
  this.loHash ^= this.loTurn;
  this.hiHash ^= this.hiTurn;
  
  //}}}
  //{{{  push rep hash
  //
  //  Repetitions are cancelled by pawn moves, castling, captures, EP
  //  and promotions; i.e. moves that are not reversible.  The nearest
  //  repetition is 5 indexes back from the current one and then that
  //  and every other one entry is a possible rep.  Can also check for
  //  50 move rule by testing hi-lo > 100 - it's not perfect because of
  //  the pawn move reset but it's a type 2 error, so safe.
  //
  
  this.repLoHash[this.repHi] = this.loHash;
  this.repHiHash[this.repHi] = this.hiHash;
  
  this.repHi++;
  
  if ((move & (MOVE_SPECIAL_MASK | MOVE_TOOBJ_MASK)) || frPiece == PAWN)
    this.repLo = this.repHi;
  
  //}}}
}

//}}}
//{{{  .unmakeMove

lozBoard.prototype.unmakeMove = function (node,move) {

  var b = this.b;
  var z = this.z;

  var fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  var frCol = frObj & COLOR_MASK;

  b[fr] = frObj;
  b[to] = toObj;

  z[fr] = node.frZ;
  z[to] = node.toZ;

  if (frCol == WHITE)
    this.wList[node.frZ] = fr;
  else
    this.bList[node.frZ] = fr;

  //{{{  capture?
  
  if (toObj) {
  
    var toPiece = toObj & PIECE_MASK;
    var toCol   = toObj & COLOR_MASK;
  
    this.phase -= VPHASE[toPiece];
  
    if (toCol == WHITE) {
  
      this.wList[node.toZ] = to;
  
      this.wCounts[toPiece]++;
      this.wCount++;
    }
  
    else {
  
      this.bList[node.toZ] = to;
  
      this.bCounts[toPiece]++;
      this.bCount++;
    }
  }
  
  //}}}

  if (move & MOVE_SPECIAL_MASK) {
    //{{{  ikky stuff
    
    if ((frObj & COLOR_MASK) == WHITE) {
    
      var ep = to + 12;
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[ep] = B_PAWN;
        z[ep] = node.epZ;
    
        this.bList[node.epZ] = ep;
    
        this.bCounts[PAWN]++;
        this.bCount++;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
    
        this.wCounts[PAWN]++;
        this.wCounts[pro]--;
    
        this.phase += VPHASE[pro];
      }
    
      else if (move == MOVE_E1G1) {
    
        b[H1] = W_ROOK;
        b[F1] = NULL;
        z[H1] = z[F1];
        z[F1] = NO_Z;
    
        this.wList[z[H1]] = H1;
      }
    
      else if (move == MOVE_E1C1) {
    
        b[A1] = W_ROOK;
        b[D1] = NULL;
        z[A1] = z[D1];
        z[D1] = NO_Z;
    
        this.wList[z[A1]] = A1;
      }
    }
    
    else {
    
      var ep = to - 12;
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[ep] = W_PAWN;
        z[ep] = node.epZ;
    
        this.wList[node.epZ] = ep;
    
        this.wCounts[PAWN]++;
        this.wCount++;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
    
        this.bCounts[PAWN]++;
        this.bCounts[pro]--;
    
        this.phase += VPHASE[pro];
      }
    
      else if (move == MOVE_E8G8) {
    
        b[H8] = B_ROOK;
        b[F8] = NULL;
        z[H8] = z[F8];
        z[F8] = NO_Z;
    
        this.bList[z[H8]] = H8;
      }
    
      else if (move == MOVE_E8C8) {
    
        b[A8] = B_ROOK;
        b[D8] = NULL;
        z[A8] = z[D8];
        z[D8] = NO_Z;
    
        this.bList[z[A8]] = A8;
      }
    }
    
    //}}}
  }
}

//}}}
//{{{  .isKingAttacked

lozBoard.prototype.isKingAttacked = function(byCol) {

  return this.isAttacked((byCol == WHITE) ? this.bList[0] : this.wList[0], byCol);
}

//}}}
//{{{  .isAttacked

lozBoard.prototype.isAttacked = function(to, byCol) {

  var b  = this.b;
  var fr = 0;

  //{{{  colour stuff
  
  if (byCol == WHITE) {
  
    if (b[to+13] == W_PAWN || b[to+11] == W_PAWN)
      return 1;
  
    var RQ = IS_WRQ;
    var BQ = IS_WBQ;
  }
  
  else {
  
    if (b[to-13] == B_PAWN || b[to-11] == B_PAWN)
      return 1;
  
    var RQ = IS_BRQ;
    var BQ = IS_BBQ;
  }
  
  var knight = KNIGHT | byCol;
  var king   = KING   | byCol;
  
  //}}}

  //{{{  knights
  
  if (b[to + -10] == knight) return 1;
  if (b[to + -23] == knight) return 1;
  if (b[to + -14] == knight) return 1;
  if (b[to + -25] == knight) return 1;
  if (b[to +  10] == knight) return 1;
  if (b[to +  23] == knight) return 1;
  if (b[to +  14] == knight) return 1;
  if (b[to +  25] == knight) return 1;
  
  //}}}
  //{{{  queen, bishop, rook
  
  fr = to + 1;  while (!b[fr]) fr += 1;  if (RQ[b[fr]]) return 1;
  fr = to - 1;  while (!b[fr]) fr -= 1;  if (RQ[b[fr]]) return 1;
  fr = to + 12; while (!b[fr]) fr += 12; if (RQ[b[fr]]) return 1;
  fr = to - 12; while (!b[fr]) fr -= 12; if (RQ[b[fr]]) return 1;
  fr = to + 11; while (!b[fr]) fr += 11; if (BQ[b[fr]]) return 1;
  fr = to - 11; while (!b[fr]) fr -= 11; if (BQ[b[fr]]) return 1;
  fr = to + 13; while (!b[fr]) fr += 13; if (BQ[b[fr]]) return 1;
  fr = to - 13; while (!b[fr]) fr -= 13; if (BQ[b[fr]]) return 1;
  
  //}}}
  //{{{  kings
  
  if (b[to + -11] == king) return 1;
  if (b[to + -13] == king) return 1;
  if (b[to + -12] == king) return 1;
  if (b[to + -1 ] == king) return 1;
  if (b[to +  11] == king) return 1;
  if (b[to +  13] == king) return 1;
  if (b[to +  12] == king) return 1;
  if (b[to +  1 ] == king) return 1;
  
  //}}}

  return 0;
}


//}}}
//{{{  .formatMove

lozBoard.prototype.formatMove = function (move, fmt) {

  if (move == 0)
    return 'NULL';

  var fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

  var frCoord = COORDS[fr];
  var toCoord = COORDS[to];

  var frPiece = frObj & PIECE_MASK;
  var frCol   = frObj & COLOR_MASK;
  var frName  = NAMES[frPiece];

  var toPiece = toObj & PIECE_MASK;
  var toCol   = toObj & COLOR_MASK;
  var toName  = NAMES[toPiece];

  if (move & MOVE_PROMOTE_MASK)
    var pro = PROMOTES[(move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS];
  else
    var pro = '';

  if (fmt == UCI_FMT)
    return frCoord + toCoord + pro;

  if (pro)
    pro = '=' + pro.toUpperCase();

  if (toObj != NULL) {
    if (frPiece == PAWN)
      return frCoord + 'x' + toCoord + pro;
    else
      return frName + 'x' + toCoord;
  }

  if (frPiece == PAWN)
    return toCoord + pro;

  if (move == MOVE_E1G1 || move == MOVE_E8G8)
    return 'O-O';

  if (move == MOVE_E1C1 || move == MOVE_E8C8)
    return 'O-O-O';

  return frName + toCoord;

}

//}}}
//{{{  .evaluate
//
//  Currently this is pretty much just a subset of Fruit 2.1 eval.
//

//{{{  eval constants

var MOB_NS = 4;
var MOB_NE = 4;
var MOB_BS = 5;
var MOB_BE = 5;
var MOB_RS = 2;
var MOB_RE = 4;
var MOB_QS = 1;
var MOB_QE = 2;

var MOB_NIS = IS_NBRQKE;
var MOB_BIS = IS_NBRQKE;
var MOB_RIS = IS_RQKE;
var MOB_QIS = IS_QKE;

var ATT_N = 1;
var ATT_B = 1;
var ATT_R = 3;
var ATT_Q = 4;
var ATT_W = [0,0,0.5,0.75,0.88,0.94,0.97,0.99];
var ATT_L = 7;
var ATT_M = 20;

var WSHELTER = new Uint32Array([0,  0,  0,  11, 20, 27, 32, 35, 0, 36]);
var BSHELTER = new Uint32Array([36, 0,  35, 32, 27, 20, 11, 0,  0, 0]);
var WSTORM   = new Uint32Array([0,  0,  0,  60, 30, 10, 0,  0,  0, 0]);
var BSTORM   = new Uint32Array([0,  0,  0,  0,  10, 30, 60, 0,  0, 0]);

var PTT_EXACT = 1;
var PTT_WHOME = 2;
var PTT_BHOME = 4;
var PTT_WPASS = 8;
var PTT_BPASS = 16;

var PAWN_DOUBLED_S  = 10;
var PAWN_DOUBLED_E  = 20;
var PAWN_ISOLATED_S = 10;
var PAWN_ISOLATED_E = 20;
var PAWN_BACKWARD_S = 8;
var PAWN_BACKWARD_E = 10;
var PAWN_PASSED     = [0,0,0,0,0.1,0.3,0.6,1.0,0];  // rank bonus curve.

var W_PROMOTE_SQ = [0,26, 27, 28, 29, 30, 31, 32, 33];
var B_PROMOTE_SQ = [0,110,111,112,113,114,115,116,117];

//}}}

lozBoard.prototype.evaluate = function (turn) {

  //this.hashCheck(turn);

  //{{{  init
  
  var uci = this.lozza.uci;
  var b   = this.b;
  
  var phase = this.phase;
  
  if (phase < 0)            // because of say 3 queens early on.
    phase = 0;
  
  if (phase > TPHASE)
    phase = TPHASE;
  
  this.gPhase = (phase << 8) / TPHASE + 0.5 | 0;
  
  var numPieces = this.wCount + this.bCount;
  
  var wNumQueens  = this.wCounts[QUEEN];
  var wNumRooks   = this.wCounts[ROOK];
  var wNumBishops = this.wCounts[BISHOP];
  var wNumKnights = this.wCounts[KNIGHT];
  var wNumPawns   = this.wCounts[PAWN];
  
  var bNumQueens  = this.bCounts[QUEEN];
  var bNumRooks   = this.bCounts[ROOK];
  var bNumBishops = this.bCounts[BISHOP];
  var bNumKnights = this.bCounts[KNIGHT];
  var bNumPawns   = this.bCounts[PAWN];
  
  var wKingSq   = this.wList[0];
  var wKingRank = RANK[wKingSq];
  var wKingFile = FILE[wKingSq];
  
  var bKingSq   = this.bList[0];
  var bKingRank = RANK[bKingSq];
  var bKingFile = FILE[bKingSq];
  
  var wKingBits = (wKingFile-1) << 2;
  var wKingMask = 0xF << wKingBits;
  
  var bKingBits = (bKingFile-1) << 2;
  var bKingMask = 0xF << bKingBits;
  
  var bonus   = 0;  // generic.
  var penalty = 0;  // generic.
  
  var WKZ = WKZONES[wKingSq];
  var BKZ = BKZONES[bKingSq];
  
  var wCanBeAttacked = bNumQueens && (bNumRooks || bNumBishops || bNumKnights);
  var bCanBeAttacked = wNumQueens && (wNumRooks || wNumBishops || wNumKnights);
  
  //}}}
  //{{{  draw?
  
  //todo - lots more here and drawish.
  
  if (numPieces == 2)                                                                  // K v K.
    return CONTEMPT;
  
  if (numPieces == 3 && (wNumKnights || wNumBishops || bNumKnights || bNumBishops))    // K v K+N|B.
    return CONTEMPT;
  
  if (numPieces == 4 && (wNumKnights || wNumBishops) && (bNumKnights || bNumBishops))  // K+N|B v K+N|B.
    return CONTEMPT;
  
  if (numPieces == 4 && (wNumKnights == 2 || bNumKnights == 2))                        // K v K+NN.
    return CONTEMPT;
  
  if (numPieces == 5 && wNumKnights == 2 && (bNumKnights || bNumBishops))              //
    return CONTEMPT;                                                                   //
                                                                                       // K+N|B v K+NN
  if (numPieces == 5 && bNumKnights == 2 && (wNumKnights || wNumBishops))              //
    return CONTEMPT;                                                                   //
  
  if (numPieces == 5 && wNumBishops == 2 && bNumBishops)                               //
    return CONTEMPT;                                                                   //
                                                                                       // K+B v K+BB
  if (numPieces == 5 && bNumBishops == 2 && wNumBishops)                               //
    return CONTEMPT;                                                                   //
  
  if (numPieces == 4 && wNumRooks && bNumRooks)                                        // K+R v K+R.
    return CONTEMPT;
  
  if (numPieces == 4 && wNumQueens && bNumQueens)                                      // K+Q v K+Q.
    return CONTEMPT;
  
  //}}}

  //{{{  P
  
  //{{{  vars valid if hash used or not
  
  var pawnsS = 0;            // pawn eval.
  var pawnsE = 0;
  
  var wPassed = 0;
  var bPassed = 0;
  
  var wHome   = 0;           // non zero if >= 1 W pawn on home rank.
  var bHome   = 0;           // non zero if >= 1 B pawn on home rank.
  
  var wLeast  = 0x99999999;  // rank of least advanced pawns per file.
  var bLeast  = 0x00000000;  // rank of least advanced pawns per file.
  
  var wMost   = 0x00000000;  // rank of most advanced pawns per file.
  var bMost   = 0x99999999;  // rank of most advanced pawns per file.
  
  var wLeastL = 0;           // wLeast << 4.
  var bLeastL = 0;
  
  var wMostL  = 0;
  var bMostL  = 0;
  
  var wLeastR = 0;           // wLeast >>> 4.
  var bLeastR = 0;
  
  var wMostR  = 0;
  var bMostR  = 0;
  
  //}}}
  
  var idx   = this.ploHash & PTTMASK;
  var flags = this.pttFlags[idx];
  
  if ((flags & PTT_EXACT) && this.pttLo[idx] == this.ploHash && this.pttHi[idx] == this.phiHash) {
    //{{{  get tt
    
    pawnsS = this.pttScoreS[idx];
    pawnsE = this.pttScoreE[idx];
    
    wLeast = this.pttwLeast[idx];
    bLeast = this.pttbLeast[idx];
    
    wMost  = this.pttwMost[idx];
    bMost  = this.pttbMost[idx];
    
    wHome  = flags & PTT_WHOME;
    bHome  = flags & PTT_BHOME;
    
    wPassed  = flags & PTT_WPASS;
    bPassed  = flags & PTT_BPASS;
    
    wLeastR = (wLeast >>> 4) | 0x90000000;
    wLeastL = (wLeast <<  4) | 0x00000009;
    
    wMostR = (wMost >>> 4);
    wMostL = (wMost <<  4);
    
    bLeastR = bLeast >>> 4;
    bLeastL = bLeast <<  4;
    
    bMostR = (bMost >>> 4) | 0x90000000;
    bMostL = (bMost <<  4) | 0x00000009;
    
    //}}}
  }
  
  else {
    //{{{  phase 1
    
    //{{{  white
    
    var next  = this.firstWP;
    var count = 0;
    
    while (count < wNumPawns) {
    
      var sq = this.wList[next];
    
      if (!sq || b[sq] != W_PAWN) {
        next++;
        continue;
      }
    
      var rank   = RANK[sq];
      var file   = FILE[sq];
      var bits   = (file-1) << 2;
      var mask   = 0xF << bits;
      var lRank  = (wLeast & mask) >>> bits;
      var mRank  = (wMost  & mask) >>> bits;
    
      if (lRank != 9) {
        pawnsS -= PAWN_DOUBLED_S;
        pawnsE -= PAWN_DOUBLED_E;
      }
    
      if (rank < lRank)
        wLeast = (wLeast & ~mask) | (rank << bits);
    
      if (rank > mRank)
        wMost  = (wMost  & ~mask) | (rank << bits);
    
      if (rank == 2)
        wHome = PTT_WHOME;
    
      count++;
      next++
    }
    
    wLeastR = (wLeast >>> 4) | 0x90000000;
    wLeastL = (wLeast <<  4) | 0x00000009;
    
    wMostR  = (wMost >>> 4);
    wMostL  = (wMost <<  4);
    
    //}}}
    //{{{  black
    
    var next  = this.firstBP;
    var count = 0;
    
    while (count < bNumPawns) {
    
      var sq = this.bList[next];
    
      if (!sq || b[sq] != B_PAWN) {
        next++;
        continue;
      }
    
      var rank   = RANK[sq];
      var file   = FILE[sq];
      var bits   = (file-1) << 2;
      var mask   = 0xF << bits;
      var lRank  = (bLeast & mask) >>> bits;
      var mRank  = (bMost  & mask) >>> bits;
    
      if (lRank != 0) {
    
        pawnsS += PAWN_DOUBLED_S;
        pawnsE += PAWN_DOUBLED_E;
      }
    
      if (rank > lRank)
        bLeast = (bLeast & ~mask) | (rank << bits);
    
      if (rank < mRank)
        bMost  = (bMost & ~mask)  | (rank << bits);
    
      if (rank == 7)
        bHome = PTT_BHOME;
    
      count++;
      next++
    }
    
    bLeastR = bLeast >>> 4;
    bLeastL = bLeast <<  4;
    
    bMostR  = (bMost >>> 4) | 0x90000000;
    bMostL  = (bMost <<  4) | 0x00000009;
    
    //}}}
    
    //}}}
    //{{{  phase 2
    
    //{{{  white
    
    var next  = this.firstWP;
    var count = 0;
    
    while (count < wNumPawns) {
    
      var sq = this.wList[next];
    
      if (!sq || b[sq] != W_PAWN) {
        next++;
        continue;
      }
    
      var file  = FILE[sq];
      var bits  = (file-1) << 2;
      var rank  = RANK[sq];
      var open  = 0;
    
      if ((wMost >>> bits & 0xF) == rank && (bLeast >>> bits & 0xF) < rank) {
        open = 1;
      }
    
      if ((wLeastL >>> bits & 0xF) == 9 && (wLeastR >>> bits & 0xF) == 9) {
        pawnsS -= PAWN_ISOLATED_S + PAWN_ISOLATED_S * open;
        pawnsE -= PAWN_ISOLATED_E;
      }
    
      else if ((wLeastL >>> bits & 0xF) > rank && (wLeastR >>> bits & 0xF) > rank) {
        var backward = true;
        if ((IS_WP[b[sq-11]] || IS_WP[b[sq-13]]) && !IS_P[b[sq-12]] && !IS_BP[b[sq-11]] && !IS_BP[b[sq-13]] && !IS_BP[b[sq-23]] && !IS_BP[b[sq-25]])
          backward = false;
        else if (rank == 2 && (IS_WP[b[sq-23]] || IS_WP[b[sq-25]]) && !IS_P[b[sq-12]] && !IS_P[b[sq-24]] && !IS_BP[b[sq-11]] && !IS_BP[b[sq-13]] && !IS_BP[b[sq-23]] && !IS_BP[b[sq-25]] && !IS_BP[b[sq-37]] && !IS_BP[b[sq-35]])
          backward = false;
        if (backward) {
          pawnsS -= PAWN_BACKWARD_S + PAWN_BACKWARD_S * open;
          pawnsE -= PAWN_BACKWARD_E;
        }
      }
    
      if (open) {
        if ((bLeastL >>> bits & 0xF) <= rank && (bLeastR >>> bits & 0xF) <= rank) {
          wPassed = PTT_WPASS;
        }
        else {
          var defenders = 0;
          var sq2       = sq;
          while (b[sq2] != EDGE) {
            defenders += IS_WP[b[sq2+1]];
            defenders += IS_WP[b[sq2-1]];
            sq2 += 12;
          }
          var attackers = 0;
          var sq2       = sq-12;
          while (b[sq2] != EDGE) {
            attackers += IS_BP[b[sq2+1]];
            attackers += IS_BP[b[sq2-1]];
            sq2 -= 12;
          }
          if (defenders >= attackers) {
            defenders = IS_WP[b[sq+11]] + IS_WP[b[sq+13]];
            attackers = IS_BP[b[sq-11]] + IS_BP[b[sq-13]];
            if (defenders >= attackers) {
              pawnsS += 5  + 50  * PAWN_PASSED[rank] | 0;
              pawnsE += 10 + 100 * PAWN_PASSED[rank] | 0;
            }
          }
        }
      }
    
      count++;
      next++
    }
    
    //}}}
    //{{{  black
    
    var next  = this.firstBP;
    var count = 0;
    
    while (count < bNumPawns) {
    
      var sq = this.bList[next];
    
      if (!sq || b[sq] != B_PAWN) {
        next++;
        continue;
      }
    
      var file  = FILE[sq];
      var bits  = (file-1) << 2;
      var rank  = RANK[sq];
      var open  = 0;
    
      if ((bMost >>> bits & 0xF) == rank && (wLeast >>> bits & 0xF) > rank) {
        open = 1;
      }
    
      if ((bLeastL >>> bits & 0xF) == 0x0 && (bLeastR >>> bits & 0xF) == 0x0) {
        pawnsS += PAWN_ISOLATED_S + PAWN_ISOLATED_S * open;
        pawnsE += PAWN_ISOLATED_E;
      }
    
      else if ((bLeastL >>> bits & 0xF) < rank && (bLeastR >>> bits & 0xF) < rank) {
        var backward = true;
        if ((IS_BP[b[sq+11]] || IS_BP[b[sq+13]]) && !IS_P[b[sq+12]] && !IS_WP[b[sq+11]] && !IS_WP[b[sq+13]] && !IS_WP[b[sq+23]] && !IS_WP[b[sq+25]])
          backward = false;
        else if (rank == 7 && (IS_BP[b[sq+23]] || IS_BP[b[sq+25]]) && !IS_P[b[sq+12]] && !IS_P[b[sq+24]] && !IS_WP[b[sq+11]] && !IS_WP[b[sq+13]] && !IS_WP[b[sq+23]] && !IS_WP[b[sq+25]] && !IS_WP[b[sq+37]] && !IS_WP[b[sq+35]])
          backward = false;
        if (backward) {
          pawnsS += PAWN_BACKWARD_S + PAWN_BACKWARD_S * open;
          pawnsE += PAWN_BACKWARD_E;
        }
      }
    
      if (open) {
        if ((wLeastL >>> bits & 0xF) >= rank && (wLeastR >>> bits & 0xF) >= rank) {
          bPassed = PTT_BPASS;
        }
        else {
          var defenders = 0;
          var sq2       = sq;
          while (b[sq2] != EDGE) {
            defenders += IS_BP[b[sq2+1]];
            defenders += IS_BP[b[sq2-1]];
            sq2 -= 12;
          }
          var attackers = 0;
          var sq2       = sq+12;
          while (b[sq2] != EDGE) {
            attackers += IS_WP[b[sq2+1]];
            attackers += IS_WP[b[sq2-1]];
            sq2 += 12;
          }
          if (defenders >= attackers) {
            defenders = IS_BP[b[sq-11]] + IS_BP[b[sq-13]];
            attackers = IS_WP[b[sq+11]] + IS_WP[b[sq+13]];
            if (defenders >= attackers) {
              pawnsS -= 5  + 50  * PAWN_PASSED[9-rank] | 0;
              pawnsE -= 10 + 100 * PAWN_PASSED[9-rank] | 0;
            }
          }
        }
      }
    
      count++;
      next++
    }
    
    //}}}
    
    //}}}
    //{{{  put tt
    
    this.pttFlags[idx]  = PTT_EXACT | wHome | bHome | wPassed | bPassed;
    
    this.pttLo[idx]     = this.ploHash;
    this.pttHi[idx]     = this.phiHash;
    
    this.pttScoreS[idx] = pawnsS;
    this.pttScoreE[idx] = pawnsE;
    
    this.pttwLeast[idx] = wLeast;
    this.pttbLeast[idx] = bLeast;
    
    this.pttwMost[idx]  = wMost;
    this.pttbMost[idx]  = bMost;
    
    //}}}
  }
  
  //{{{  phase 3
  //
  // Only pawns are included in the hash, so evaluation taht includes other
  // pieces must be onde here.
  //
  
  //{{{  white
  
  if (wPassed) {
  
    var next  = this.firstWP;
    var count = 0;
  
    while (count < wNumPawns) {
  
      var sq = this.wList[next];
  
      if (!sq || b[sq] != W_PAWN) {
        next++;
        continue;
      }
  
      var file  = FILE[sq];
      var bits  = (file-1) << 2;
      var rank  = RANK[sq];
      var sq2   = sq-12;
  
      if ((wMost >>> bits & 0xF) == rank && (bLeast >>> bits & 0xF) < rank) {  // open.
        if ((bLeastL >>> bits & 0xF) <= rank && (bLeastR >>> bits & 0xF) <= rank) {  // passed.
  
          //{{{  king dist
          
          var passKings = 20 * DIST[bKingSq][sq2] - 5 * DIST[wKingSq][sq2];
          
          //}}}
          //{{{  attacked?
          
          var passFree = 0;
          
          if (!b[sq2])
            passFree = 60 * (!this.isAttacked(sq2,BLACK)|0);
          
          //}}}
          //{{{  unstoppable
          
          var passUnstop    = 0;
          var oppoOnlyPawns = bNumPawns + 1 == this.bCount;
          
          if (oppoOnlyPawns) {
          
            var promSq = W_PROMOTE_SQ[file];
          
            if (DIST[wKingSq][sq] <= 1 && DIST[wKingSq][promSq] <= 1)
              passUnstop = 800;
          
            else if (DIST[sq][promSq] < DIST[bKingSq][promSq] + ((turn==WHITE)|0) - 1) {  // oppo cannot get there
          
              var blocked = 0;
              while(!b[sq2])
                sq2 -= 12;
              if (b[sq2] == EDGE)
                passUnstop = 800;
            }
          }
          
          //}}}
  
          pawnsS += 10 + (60                                     ) * PAWN_PASSED[rank] | 0;
          pawnsE += 20 + (120 + passKings + passFree + passUnstop) * PAWN_PASSED[rank] | 0;
  
          //console.log('W PASS',COORDS[sq],'Kdist,free,unstop=',passKings,passFree,passUnstop);
        }
      }
      count++;
      next++
    }
  }
  
  //}}}
  //{{{  black
  
  if (bPassed) {
  
    var next  = this.firstBP;
    var count = 0;
  
    while (count < bNumPawns) {
  
      var sq = this.bList[next];
  
      if (!sq || b[sq] != B_PAWN) {
        next++;
        continue;
      }
  
      var file  = FILE[sq];
      var bits  = (file-1) << 2;
      var rank  = RANK[sq];
      var sq2   = sq+12;
  
      if ((bMost >>> bits & 0xF) == rank && (wLeast >>> bits & 0xF) > rank) {  // open.
        if ((wLeastL >>> bits & 0xF) >= rank && (wLeastR >>> bits & 0xF) >= rank) {  // passed.
          //{{{  king dist
          
          var passKings = 20 * DIST[wKingSq][sq2] - 5 * DIST[bKingSq][sq2];
          
          //}}}
          //{{{  attacked?
          
          var passFree = 0;
          
          if (!b[sq2])
            passFree = 60 * (!this.isAttacked(sq2,WHITE)|0);
          
          //}}}
          //{{{  unstoppable
          
          var passUnstop    = 0;
          var oppoOnlyPawns = wNumPawns + 1 == this.wCount;
          
          if (oppoOnlyPawns) {
          
            var promSq = B_PROMOTE_SQ[file];
          
            if (DIST[bKingSq][sq] <= 1 && DIST[bKingSq][promSq] <= 1)
              passUnstop = 800;
          
            else if (DIST[sq][promSq] < DIST[wKingSq][promSq] + ((turn==BLACK)|0) - 1) {  // oppo cannot get there
          
              var blocked = 0;
              while(!b[sq2])
                sq2 += 12;
              if (b[sq2] == EDGE)
                passUnstop = 800;
            }
          }
          
          //}}}
  
          pawnsS -= 10 + (60                                     ) * PAWN_PASSED[9-rank] | 0;
          pawnsE -= 20 + (120 + passKings + passFree + passUnstop) * PAWN_PASSED[9-rank] | 0;
  
          //console.log('B PASS',COORDS[sq],'Kdist,free,unstop=',passKings,passFree,passUnstop);
        }
      }
      count++;
      next++
    }
  }
  
  //}}}
  
  //if (bPassed || wPassed)
    //console.log('----------------------------')
  
  //}}}
  
  //}}}
  //{{{  K
  
  var penalty = 0;
  
  var kingS = 0;
  var kingE = 0;
  
  if (wCanBeAttacked) {
    //{{{  shelter
    
    penalty = 0;
    
    penalty += WSHELTER[(wLeast & wKingMask) >>> wKingBits] * 2;
    
    if (wKingFile != 8)
      penalty += WSHELTER[(wLeastR & wKingMask) >>> wKingBits];
    
    if (wKingFile != 1)
      penalty += WSHELTER[(wLeastL & wKingMask) >>> wKingBits];
    
    if (penalty == 0)
      penalty = 11;
    
    kingS -= penalty;
    
    //}}}
    //{{{  storm
    
    penalty = 0;
    
    penalty += WSTORM[(bMost & wKingMask) >>> wKingBits];
    
    if (wKingFile != 8)
      penalty += WSTORM[(bMostR & wKingMask) >>> wKingBits];
    
    if (wKingFile != 1)
      penalty += WSTORM[(bMostL & wKingMask) >>> wKingBits];
    
    kingS -= penalty;
    
    //}}}
  }
  
  if (bCanBeAttacked) {
    //{{{  shelter
    
    penalty = 0;
    
    penalty += BSHELTER[(bLeast & bKingMask) >>> bKingBits] * 2;
    
    if (bKingFile != 8)
      penalty += BSHELTER[(bLeastR & bKingMask) >>> bKingBits];
    
    if (bKingFile != 1)
      penalty += BSHELTER[(bLeastL & bKingMask) >>> bKingBits];
    
    if (penalty == 0)
      penalty = 11;
    
    kingS += penalty;
    
    //}}}
    //{{{  storm
    
    penalty = 0;
    
    penalty += BSTORM[(wMost & bKingMask) >>> bKingBits];
    
    if (bKingFile != 8)
      penalty += BSTORM[(wMostR & bKingMask) >>> bKingBits];
    
    if (bKingFile != 1)
      penalty += BSTORM[(wMostL & bKingMask) >>> bKingBits];
    
    kingS += penalty;
    
    //}}}
  }
  
  //}}}
  //{{{  NBRQ
  
  var mobS = 0;
  var mobE = 0;
  
  var attS = 0;
  var attE = 0;
  
  var knightsS = 0;
  var knightsE = 0;
  
  var bishopsS = 0;
  var bishopsE = 0;
  
  var rooksS = 0;
  var rooksE = 0;
  
  var queensS = 0;
  var queensE = 0;
  
  //{{{  white
  
  var mob     = 0;
  var to      = 0;
  var fr      = 0;
  var frObj   = 0;
  var frRank  = 0;
  var frFile  = 0;
  var frBits  = 0;
  var frMask  = 0;
  var rDist   = 0;
  var fDist   = 0;
  var wBishop = 0;
  var bBishop = 0;
  var attackN = 0;
  var attackV = 0;
  var att     = 0;
  
  var pList  = this.wList;
  var pCount = this.wCount - 1 - wNumPawns;
  
  var next  = 1;  // ignore king.
  var count = 0;
  
  while (count < pCount) {
  
    fr = pList[next++];
    if (!fr)
      continue;
  
    frObj  = b[fr];
    if (frObj == W_PAWN)
      continue;
  
    frRank = RANK[fr];
    frFile = FILE[fr];
    frBits = (frFile-1) << 2;
    frMask = 0xF << frBits;
  
    if (frObj == W_KNIGHT) {
      //{{{  N
      
      mob = 0;
      att = 0;
      
      to = fr+10; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      to = fr-10; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      to = fr+14; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      to = fr-14; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      to = fr+23; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      to = fr-23; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      to = fr+25; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      to = fr-25; mob += MOB_NIS[b[to]]; att += BKZ[to] * MOB_NIS[b[to]];
      
      mobS += mob * MOB_NS;
      mobE += mob * MOB_NE;
      
      if (att) {
        attackN++;
        attackV += ATT_N;
      }
      
      //{{{  outpost
      
      var outpost = WOUTPOST[fr];
      
      if (outpost) {
      
        if (((bLeastR & frMask) >>> frBits) <= frRank && ((bLeastL & frMask) >>> frBits) <= frRank) {
          knightsS += outpost;
          knightsS += outpost * IS_WP[b[fr+11]];
          knightsS += outpost * IS_WP[b[fr+13]];
        }
      }
      
      //}}}
      
      //}}}
    }
  
    else if (frObj == W_BISHOP) {
      //{{{  B
      
      mob = 0;
      att = 0;
      
      to = fr + 11;  while (!b[to]) {att += BKZ[to]; to += 11; mob++;} mob += MOB_BIS[b[to]]; att += BKZ[to] * MOB_BIS[b[to]];
      to = fr - 11;  while (!b[to]) {att += BKZ[to]; to -= 11; mob++;} mob += MOB_BIS[b[to]]; att += BKZ[to] * MOB_BIS[b[to]];
      to = fr + 13;  while (!b[to]) {att += BKZ[to]; to += 13; mob++;} mob += MOB_BIS[b[to]]; att += BKZ[to] * MOB_BIS[b[to]];
      to = fr - 13;  while (!b[to]) {att += BKZ[to]; to -= 13; mob++;} mob += MOB_BIS[b[to]]; att += BKZ[to] * MOB_BIS[b[to]];
      
      mobS += mob * MOB_BS;
      mobE += mob * MOB_BE;
      
      if (att) {
        attackN++;
        attackV += ATT_B;
      }
      
      wBishop += WSQUARE[fr];
      bBishop += BSQUARE[fr];
      
      //}}}
    }
  
    else if (frObj == W_ROOK) {
      //{{{  R
      
      mob = 0;
      att = 0;
      
      to = fr + 1;   while (!b[to]) {att += BKZ[to]; to += 1;  mob++;} mob += MOB_RIS[b[to]]; att += BKZ[to] * MOB_RIS[b[to]];
      to = fr - 1;   while (!b[to]) {att += BKZ[to]; to -= 1;  mob++;} mob += MOB_RIS[b[to]]; att += BKZ[to] * MOB_RIS[b[to]];
      to = fr + 12;  while (!b[to]) {att += BKZ[to]; to += 12; mob++;} mob += MOB_RIS[b[to]]; att += BKZ[to] * MOB_RIS[b[to]];
      to = fr - 12;  while (!b[to]) {att += BKZ[to]; to -= 12; mob++;} mob += MOB_RIS[b[to]]; att += BKZ[to] * MOB_RIS[b[to]];
      
      mobS += mob * MOB_RS;
      mobE += mob * MOB_RE;
      
      if (att) {
        attackN++;
        attackV += ATT_R;
      }
      
      //{{{  7th
      
      if (frRank == 7 && (bKingRank == 8 || bHome)) {
        rooksS += 20;
        rooksE += 40;
      }
      
      //}}}
      //{{{  semi/open file
      
      rooksS -= 10;
      rooksE -= 10;
      
      if (!(wMost & frMask)) {   // no w pawn.
      
        rooksS += 10;
        rooksE += 10;
      
        if (!(bLeast & frMask)) {  // no b pawn.
          rooksS += 10;
          rooksE += 10;
        }
      
        if (frFile == bKingFile) {
          rooksS += 10;
        }
      
        if (Math.abs(frFile - bKingFile) <= 1) {
          rooksS += 10;
        }
      }
      
      //}}}
      
      //}}}
    }
  
    else if (frObj == W_QUEEN) {
      //{{{  Q
      
      mob = 0;
      att = 0;
      
      to = fr + 1;   while (!b[to]) {att += BKZ[to]; to += 1;  mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      to = fr - 1;   while (!b[to]) {att += BKZ[to]; to -= 1;  mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      to = fr + 12;  while (!b[to]) {att += BKZ[to]; to += 12; mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      to = fr - 12;  while (!b[to]) {att += BKZ[to]; to -= 12; mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      
      to = fr + 11;  while (!b[to]) {att += BKZ[to]; to += 11; mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      to = fr - 11;  while (!b[to]) {att += BKZ[to]; to -= 11; mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      to = fr + 13;  while (!b[to]) {att += BKZ[to]; to += 13; mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      to = fr - 13;  while (!b[to]) {att += BKZ[to]; to -= 13; mob++;} mob += MOB_QIS[b[to]]; att += BKZ[to] * MOB_QIS[b[to]];
      
      mobS += mob * MOB_QS;
      mobE += mob * MOB_QE;
      
      if (att) {
        attackN++;
        attackV += ATT_Q;
      }
      
      //{{{  7th rank
      
      if (frRank == 7 && (bKingRank == 8 || bHome)) {
        queensS += 10;
        queensE += 20;
      }
      
      //}}}
      
      //}}}
    }
  
    count++;
  }
  
  if (bCanBeAttacked) {
  
    if (attackN > ATT_L)
      attackN = ATT_L;
  
    attS += (attackV * ATT_M * ATT_W[attackN]) | 0;
    attE += 0;
  }
  
  if (wBishop && bBishop) {
    bishopsS += 50;
    bishopsE += 50;
  }
  
  //}}}
  //{{{  black
  
  var mob     = 0;
  var to      = 0;
  var fr      = 0;
  var frObj   = 0;
  var frRank  = 0;
  var frFile  = 0;
  var frBits  = 0;
  var frMask  = 0;
  var rDist   = 0;
  var fDist   = 0;
  var wBishop = 0;
  var bBishop = 0;
  var attackN = 0;
  var attackV = 0;
  var att     = 0;
  
  var pList  = this.bList;
  var pCount = this.bCount - 1 - bNumPawns;
  
  var next  = 1;  // ignore king.
  var count = 0;
  
  while (count < pCount) {
  
    fr = pList[next++];
    if (!fr)
      continue;
  
    frObj = b[fr];
  
    if (frObj == B_PAWN)
      continue;
  
    frRank  = RANK[fr];
    frFile  = FILE[fr];
    frBits  = (frFile-1) << 2;
    frMask  = 0xF << frBits;
  
    if (frObj == B_KNIGHT) {
      //{{{  N
      
      mob = 0;
      att = 0;
      
      to = fr+10; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      to = fr-10; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      to = fr+14; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      to = fr-14; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      to = fr+23; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      to = fr-23; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      to = fr+25; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      to = fr-25; mob += MOB_NIS[b[to]]; att += WKZ[to] * MOB_NIS[b[to]];
      
      mobS -= mob * MOB_NS;
      mobE -= mob * MOB_NE;
      
      if (att) {
        attackN++;
        attackV += ATT_N;
      }
      
      //{{{  outpost
      
      var outpost = BOUTPOST[fr];
      
      if (outpost) {
      
        if (((wLeastR & frMask) >>> frBits) >= frRank && ((wLeastL & frMask) >>> frBits) >= frRank) {
          knightsS -= outpost;
          knightsS -= outpost * IS_BP[b[fr-11]];
          knightsS -= outpost * IS_BP[b[fr-13]];
        }
      }
      
      //}}}
      
      //}}}
    }
  
    else if (frObj == B_BISHOP) {
      //{{{  B
      
      mob = 0;
      att = 0;
      
      to = fr + 11;  while (!b[to]) {att += WKZ[to]; to += 11; mob++;} mob += MOB_BIS[b[to]]; att += WKZ[to] * MOB_BIS[b[to]];
      to = fr - 11;  while (!b[to]) {att += WKZ[to]; to -= 11; mob++;} mob += MOB_BIS[b[to]]; att += WKZ[to] * MOB_BIS[b[to]];
      to = fr + 13;  while (!b[to]) {att += WKZ[to]; to += 13; mob++;} mob += MOB_BIS[b[to]]; att += WKZ[to] * MOB_BIS[b[to]];
      to = fr - 13;  while (!b[to]) {att += WKZ[to]; to -= 13; mob++;} mob += MOB_BIS[b[to]]; att += WKZ[to] * MOB_BIS[b[to]];
      
      mobS -= mob * MOB_BS;
      mobE -= mob * MOB_BE;
      
      if (att) {
        attackN++;
        attackV += ATT_B;
      }
      
      wBishop += WSQUARE[fr];
      bBishop += BSQUARE[fr];
      
      //}}}
    }
  
    else if (frObj == B_ROOK) {
      //{{{  R
      
      mob = 0;
      att = 0;
      
      to = fr + 1;   while (!b[to]) {att += WKZ[to]; to += 1;  mob++;} mob += MOB_RIS[b[to]]; att += WKZ[to] * MOB_RIS[b[to]];
      to = fr - 1;   while (!b[to]) {att += WKZ[to]; to -= 1;  mob++;} mob += MOB_RIS[b[to]]; att += WKZ[to] * MOB_RIS[b[to]];
      to = fr + 12;  while (!b[to]) {att += WKZ[to]; to += 12; mob++;} mob += MOB_RIS[b[to]]; att += WKZ[to] * MOB_RIS[b[to]];
      to = fr - 12;  while (!b[to]) {att += WKZ[to]; to -= 12; mob++;} mob += MOB_RIS[b[to]]; att += WKZ[to] * MOB_RIS[b[to]];
      
      mobS -= mob * MOB_RS;
      mobE -= mob * MOB_RE;
      
      if (att) {
        attackN++;
        attackV += ATT_R;
      }
      
      //{{{  7th rank
      
      if (frRank == 2 && (wKingRank == 1 || wHome)) {
        rooksS -= 20;
        rooksE -= 40;
      }
      
      //}}}
      //{{{  semi/open file
      
      rooksS += 10;
      rooksE += 10;
      
      if (!(bLeast & frMask)) { // no b pawn.
      
        rooksS -= 10;
        rooksE -= 10;
      
        if (!(wMost & frMask)) {  // no w pawn.
          rooksS -= 10;
          rooksE -= 10;
        }
      
        if (frFile == wKingFile) {
          rooksS -= 10;
        }
      
        if (Math.abs(frFile - wKingFile) <= 1) {
          rooksS -= 10;
        }
      }
      
      //}}}
      
      //}}}
    }
  
    else if (frObj == B_QUEEN) {
      //{{{  Q
      
      mob = 0;
      att = 0;
      
      to = fr + 1;   while (!b[to]) {att += WKZ[to]; to += 1;  mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      to = fr - 1;   while (!b[to]) {att += WKZ[to]; to -= 1;  mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      to = fr + 12;  while (!b[to]) {att += WKZ[to]; to += 12; mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      to = fr - 12;  while (!b[to]) {att += WKZ[to]; to -= 12; mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      
      to = fr + 11;  while (!b[to]) {att += WKZ[to]; to += 11; mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      to = fr - 11;  while (!b[to]) {att += WKZ[to]; to -= 11; mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      to = fr + 13;  while (!b[to]) {att += WKZ[to]; to += 13; mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      to = fr - 13;  while (!b[to]) {att += WKZ[to]; to -= 13; mob++;} mob += MOB_QIS[b[to]]; att += WKZ[to] * MOB_QIS[b[to]];
      
      mobS -= mob * MOB_QS;
      mobE -= mob * MOB_QE;
      
      if (att) {
        attackN++;
        attackV += ATT_Q;
      }
      
      //{{{  7th rank
      
      if (frRank == 2 && (wKingRank == 1 || wHome)) {
        queensS -= 10;
        queensE -= 20;
      }
      
      //}}}
      
      //}}}
    }
  
    count++;
  }
  
  if (wCanBeAttacked) {
  
    if (attackN > ATT_L)
      attackN = ATT_L;
  
    attS -= (attackV * ATT_M * ATT_W[attackN]) | 0;
    attE -= 0;
  }
  
  if (wBishop && bBishop) {
    bishopsS -= 50;
    bishopsE -= 50;
  }
  
  //}}}
  
  //}}}

  //{{{  trapped
  
  var trappedS = 0;
  var trappedE = 0;
  
  //{{{  trapped bishops
  
  var trap = 0;
  
  if (wNumBishops) {
  
    trap = 0;
  
    trap += IS_WB[b[SQA7]] & IS_BP[b[SQB6]];
    trap += IS_WB[b[SQH7]] & IS_BP[b[SQG6]];
  
    trap += IS_WB[b[SQB8]] & IS_BP[b[SQC7]];
    trap += IS_WB[b[SQG7]] & IS_BP[b[SQF7]];
  
    trap += IS_WB[b[SQA6]] & IS_BP[b[SQB5]];
    trap += IS_WB[b[SQH6]] & IS_BP[b[SQG5]];
  
    trap += IS_WB[b[SQC1]] & IS_WP[b[SQD2]] & IS_O[b[SQD3]];
    trap += IS_WB[b[SQF1]] & IS_WP[b[SQE2]] & IS_O[b[SQE3]];
  
    trappedS -= trap * 100;
    trappedE -= trap * 100;
  }
  
  if (bNumBishops) {
  
    trap = 0;
  
    trap += IS_BB[b[SQA2]] & IS_WP[b[SQB3]];
    trap += IS_BB[b[SQH2]] & IS_WP[b[SQG3]];
  
    trap += IS_BB[b[SQB1]] & IS_WP[b[SQC2]];
    trap += IS_BB[b[SQG2]] & IS_WP[b[SQF2]];
  
    trap += IS_BB[b[SQA3]] & IS_WP[b[SQB4]];
    trap += IS_BB[b[SQH3]] & IS_WP[b[SQG4]];
  
    trap += IS_BB[b[SQC8]] & IS_BP[b[SQD7]] * IS_O[b[SQD6]];
    trap += IS_BB[b[SQF8]] & IS_BP[b[SQE7]] * IS_O[b[SQE6]];
  
    trappedS += trap * 100;
    trappedE += trap * 100;
  }
  
  //}}}
  //{{{  trapped knights
  
  if (wNumKnights) {
  
    trap = 0;
  
    trap += IS_WN[b[SQA8]] & (IS_BP[b[SQA7]] | IS_BP[b[SQC7]]);
    trap += IS_WN[b[SQH8]] & (IS_BP[b[SQH7]] | IS_BP[b[SQF7]]);
  
    trap += IS_WN[b[SQA7]] & IS_BP[b[SQA6]] & IS_BP[b[SQB7]];
    trap += IS_WN[b[SQH7]] & IS_BP[b[SQH6]] & IS_BP[b[SQG7]];
  
    trap += IS_WN[b[SQA7]] & IS_BP[b[SQB7]] & IS_BP[b[SQC6]];
    trap += IS_WN[b[SQH7]] & IS_BP[b[SQG7]] & IS_BP[b[SQF6]];
  
    trappedS -= trap * 100;
    trappedE -= trap * 100;
  }
  
  if (bNumKnights) {
  
    trap = 0;
  
    trap += IS_BN[b[SQA1]] & (IS_WP[b[SQA2]] | IS_WP[b[SQC2]]);
    trap += IS_BN[b[SQH1]] & (IS_WP[b[SQH2]] | IS_WP[b[SQF2]]);
  
    trap += IS_BN[b[SQA2]] & IS_WP[b[SQA3]] & IS_WP[b[SQB2]];
    trap += IS_BN[b[SQH2]] & IS_WP[b[SQH3]] & IS_WP[b[SQG2]];
  
    trap += IS_BN[b[SQA2]] & IS_WP[b[SQB2]] & IS_WP[b[SQC3]];
    trap += IS_BN[b[SQH2]] & IS_WP[b[SQG2]] & IS_WP[b[SQF3]];
  
    trappedS += trap * 100;
    trappedE += trap * 100;
  }
  
  //}}}
  
  //}}}
  //{{{  tempo
  
  if (turn == WHITE) {
   var tempoS = 20;
   var tempoE = 10;
  }
  
  else {
   var tempoS = -20;
   var tempoE = -10;
  }
  
  //}}}

  //{{{  combine
  
  var evalS = this.runningEvalS;
  var evalE = this.runningEvalE;
  
  var numWhitePieces = this.wCount - wNumPawns;
  var numBlackPieces = this.bCount - bNumPawns;
  
  var ahead  = 0;
  var behind = 0;
  
  if (this.turn == WHITE) {
    if (evalS > 120)
       ahead=1;
    else if (evalS < -120)
      behind=1;
  }
  else {
    if (evalS > 120)
      behind=1;
    else if (evalS < -120)
      ahead=1;
  }
  
  if (ahead) {
    if (this.turn == WHITE) {
      //evalS += (this.initNumBlackPieces-numBlackPieces)*20;
      //evalE += (this.initNumBlackPieces-numBlackPieces)*20;
    }
    else {
      //evalS -= (this.initNumWhitePieces-numWhitePieces)*20;
      //evalE -= (this.initNumWhitePieces-numWhitePieces)*20;
    }
  }
  
  else if (behind) {
    if (this.turn == WHITE) {
      //evalS -= (this.initNumWhitePieces-numWhitePieces)*20;
      //evalS += (this.initNumBlackPawns-bNumPawns)*20;
      //evalE -= (this.initNumWhitePieces-numWhitePieces)*20;
      //evalE += (this.initNumBlackPawns-bNumPawns)*20;
    }
    else {
      //evalS += (this.initNumBlackPieces-numBlackPieces)*20;
      //evalS -= (this.initNumWhitePawns-wNumPawns)*20;
      //evalE += (this.initNumBlackPieces-numBlackPieces)*20;
      //evalE -= (this.initNumWhitePawns-wNumPawns)*20;
    }
  }
  
  evalS += mobS;
  evalE += mobE;
  
  evalS += trappedS;
  evalE += trappedE;
  
  evalS += tempoS;
  evalE += tempoE;
  
  evalS += attS;
  evalE += attE;
  
  evalS += pawnsS;
  evalE += pawnsE;
  
  evalS += knightsS;
  evalE += knightsE;
  
  evalS += bishopsS;
  evalE += bishopsE;
  
  evalS += rooksS;
  evalE += rooksE;
  
  evalS += queensS;
  evalE += queensE;
  
  evalS += kingS;
  evalE += kingE;
  
  var e = ((evalS * (256 - this.gPhase)) + (evalE * this.gPhase)) >> 8;
  
  //}}}
  //{{{  verbose
  
  if (this.verbose) {
    uci.send('info string','phased eval',    'PH',this.gPhase,      'VAL',e);
    uci.send('info string','evaluation',     'MG',evalS,            'EG',evalE);
    uci.send('info string','trapped',        'MG',trappedS,         'EG',trappedE);
    uci.send('info string','mobility',       'MG',mobS,             'EG',mobE);
    uci.send('info string','attacks',        'MG',attS,             'EG',attE);
    uci.send('info string','material',       'MG',this.runningEvalS,'EG',this.runningEvalE);
    uci.send('info string','king',           'MG',kingS,            'EG',kingE);
    uci.send('info string','queens',         'MG',queensS,          'EG',queensE);
    uci.send('info string','rooks',          'MG',rooksS,           'EG',rooksE);
    uci.send('info string','bishops',        'MG',bishopsS,         'EG',bishopsE);
    uci.send('info string','knights',        'MG',knightsS,         'EG',knightsE);
    uci.send('info string','pawns',          'MG',pawnsS,           'EG',pawnsE);
    uci.send('info string','home pawn',      'W', wHome != 0,       'B', bHome != 0);
    uci.send('info string','tempo',          'MG',tempoS,           'EG',tempoE);
  }
  
  //}}}

  e *= ((-turn >> 31) | 1);

  return e;
}

//}}}
//{{{  .rand32

lozBoard.prototype.rand32 = function () {

  return Math.random() * 0xFFFFFFFF | 0;

}

//}}}
//{{{  .ttPut

lozBoard.prototype.ttPut = function (type,depth,score,move,ply,alpha,beta) {

  var idx = this.loHash & TTMASK;

  //if (this.ttType[idx] == TT_EXACT && this.loHash == this.ttLo[idx] && this.hiHash == this.ttHi[idx] && this.ttDepth[idx] > depth && this.ttScore[idx] > alpha && this.ttScore[idx] < beta) {
    //return;
  //}

  if (this.ttType[idx] == TT_EMPTY)
    this.hashUsed++;

  if (score <= -MINMATE && score >= -MATE)
    score -= ply;

  else if (score >= MINMATE && score <= MATE)
    score += ply;

  this.ttLo[idx]    = this.loHash;
  this.ttHi[idx]    = this.hiHash;
  this.ttType[idx]  = type;
  this.ttDepth[idx] = depth;
  this.ttScore[idx] = score;
  this.ttMove[idx]  = move;
}

//}}}
//{{{  .ttGet

lozBoard.prototype.ttGet = function (node, depth, alpha, beta) {

  var idx   = this.loHash & TTMASK;
  var type  = this.ttType[idx];

  node.hashMove = 0;

  if (type == TT_EMPTY) {
    return TTSCORE_UNKNOWN;
  }

  var lo = this.ttLo[idx];
  var hi = this.ttHi[idx];

  if (lo != this.loHash || hi != this.hiHash) {
    return TTSCORE_UNKNOWN;
  }

  //
  // Set the hash move before the depth check
  // so that iterative deepening works.
  //

  node.hashMove = this.ttMove[idx];

  if (this.ttDepth[idx] < depth) {
    return TTSCORE_UNKNOWN;
  }

  var score = this.ttScore[idx];

  if (score <= -MINMATE && score >= -MATE)
    score += node.ply;

  else if (score >= MINMATE && score <= MATE)
    score -= node.ply;

  if (type == TT_EXACT) {
    return score;
   }

  if (type == TT_ALPHA && score <= alpha) {
    return score;
  }

  if (type == TT_BETA && score >= beta) {
    return score;
  }

  return TTSCORE_UNKNOWN;
}

//}}}
//{{{  .ttGetMove

lozBoard.prototype.ttGetMove = function (node) {

  var idx = this.loHash & TTMASK;

  if (this.ttType[idx] != TT_EMPTY && this.ttLo[idx] == this.loHash && this.ttHi[idx] == this.hiHash)
    return this.ttMove[idx];

  return 0;
}

//}}}
//{{{  .ttInit

lozBoard.prototype.ttInit = function () {

  this.loHash = 0;
  this.hiHash = 0;

  this.ploHash = 0;
  this.phiHash = 0;

  for (var i=0; i < TTSIZE; i++)
    this.ttType[i] = TT_EMPTY;

  for (var i=0; i < PTTSIZE; i++)
    this.pttFlags[i] = TT_EMPTY;

  this.hashUsed = 0;
}

//}}}
//{{{  .hashCheck

lozBoard.prototype.hashCheck = function (turn) {

  var loHash = 0;
  var hiHash = 0;

  var ploHash = 0;
  var phiHash = 0;

  if (turn) {
    loHash ^= this.loTurn;
    hiHash ^= this.hiTurn;
  }

  loHash ^= this.loRights[this.rights];
  hiHash ^= this.hiRights[this.rights];

  loHash ^= this.loEP[this.ep];
  hiHash ^= this.hiEP[this.ep];

  for (var sq=0; sq<144; sq++) {

    var obj = this.b[sq];

    if (obj == NULL || obj == EDGE)
      continue;

    var piece = obj & PIECE_MASK;
    var col   = obj & COLOR_MASK;

    loHash ^= this.loPieces[col>>>3][piece-1][sq];
    hiHash ^= this.hiPieces[col>>>3][piece-1][sq];

    if (piece == PAWN) {
      ploHash ^= this.loPieces[col>>>3][0][sq];
      phiHash ^= this.hiPieces[col>>>3][0][sq];
    }
  }

  if (this.loHash != loHash)
    lozza.uci.debug('*************** LO',this.loHash,loHash);

  if (this.hiHash != hiHash)
    lozza.uci.debug('*************** HI',this.hiHash,hiHash);

  if (this.ploHash != ploHash)
    lozza.uci.debug('************* PLO',this.ploHash,ploHash);

  if (this.phiHash != phiHash)
    lozza.uci.debug('************* PHI',this.phiHash,phiHash);
}

//}}}
//{{{  .fen

lozBoard.prototype.fen = function (turn) {

  var fen = '';
  var n   = 0;

  for (var i=0; i < 8; i++) {
    for (var j=0; j < 8; j++) {
      var sq  = B88[i*8 + j]
      var obj = this.b[sq];
      if (obj == NULL)
        n++;
      else {
        if (n) {
          fen += '' + n;
          n = 0;
        }
        fen += UMAP[obj];
      }
    }
    if (n) {
      fen += '' + n;
      n = 0;
    }
    if (i < 7)
      fen += '/';
  }

  if (turn == WHITE)
    fen += ' w';
  else
    fen += ' b';

  if (this.rights) {
    fen += ' ';
    if (this.rights & WHITE_RIGHTS_KING)
      fen += 'K';
    if (this.rights & WHITE_RIGHTS_QUEEN)
      fen += 'Q';
    if (this.rights & BLACK_RIGHTS_KING)
      fen += 'k';
    if (this.rights & BLACK_RIGHTS_QUEEN)
      fen += 'Q';
  }
  else
    fen += ' -';

  if (this.ep)
    fen += ' ' + COORDS[this.ep];
  else
    fen += ' -';

  fen += ' 0 1';

  return fen;
}

//}}}
//{{{  .playMove

lozBoard.prototype.playMove = function (moveStr) {

  var move     = 0;
  var node     = lozza.rootNode;
  var nextTurn = ~this.turn & COLOR_MASK;

  node.cache();

  this.genMoves(node, this.turn);

  while (move = node.getNextMove()) {

    this.makeMove(node,move);

    var attacker = this.isKingAttacked(nextTurn);

    if (attacker) {

      this.unmakeMove(node,move);
      node.uncache();

      continue;
    }

    var fMove = this.formatMove(move,UCI_FMT);

    if (moveStr == fMove || moveStr+'q' == fMove) {
      this.turn = ~this.turn & COLOR_MASK;
      return true;
    }

    this.unmakeMove(node,move);
    node.uncache();
  }

  return false;
}

//}}}
//{{{  .getPVStr

lozBoard.prototype.getPVStr = function(node,move,depth) {

  if (!node || !depth)
    return '';

  if (!move)
    move = this.ttGetMove(node);

  if (!move)
    return '';

  node.cache();
  this.makeMove(node,move);

  var mv = this.formatMove(move, this.mvFmt);
  var pv = ' ' + this.getPVStr(node.childNode,0,depth-1);

  this.unmakeMove(node,move);
  node.uncache();

  return mv + pv;
}

//}}}
//{{{  .addHistory

lozBoard.prototype.addHistory = function (depth, move) {

  var to      = (move & MOVE_TO_MASK)    >>> MOVE_TO_BITS;
  var frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  var frPiece = frObj & PIECE_MASK;

  if ((frObj & COLOR_MASK) == WHITE) {
    this.wHistory[frPiece][to] += depth*depth;
  }
  else {
    this.bHistory[frPiece][to] += depth*depth;
  }
}

//}}}
//{{{  .betaMate

lozBoard.prototype.betaMate = function (score) {

  return (score >= MINMATE && score <= MATE);
}

//}}}
//{{{  .alphaMate

lozBoard.prototype.alphaMate = function (score) {

  return (score <= -MINMATE && score >= -MATE)
}

//}}}

//}}}
//{{{  lozNode class

//                                 Killer?
// max            9007199254740992

var BASE_HASH       =  10000012000;  // no
var BASE_PROMOTES   =  10000011000;  // no
var BASE_GOODTAKES  =  10000010000;  // no
var BASE_EVENTAKES  =  10000009000;  // no
var BASE_EPTAKES    =  10000008000;  // no
var BASE_MATEKILLER =  10000007000;
var BASE_MYKILLERS  =  10000006000;
var BASE_GPKILLERS  =  10000005000;
var BASE_CASTLING   =  10000004000;  // yes
var BASE_BADTAKES   =  10000003000;  // yes
var BASE_HISSLIDE   =         2000;  // yes
var BASE_PSTSLIDE   =         1000;  // yes

var BASE_LMR        = BASE_BADTAKES;

//{{{  lozNode

function lozNode (parentNode) {

  this.ply        = 0;          //  distance from root.
  this.root       = false;      //  only true for the root node node[0].
  this.childNode  = null;       //  pointer to next node (towards leaf) in tree.
  this.parentNode = parentNode; //  pointer previous node (towards root) in tree.

  if (parentNode) {
    this.grandparentNode = parentNode.parentNode;
    parentNode.childNode = this;
  }
  else
    this.grandparentNode = null;

  this.moves = new Uint32Array(MAX_MOVES);
  this.ranks = Array(MAX_MOVES);

  for (var i=0; i < MAX_MOVES; i++) {
    this.moves[i] = 0;
    this.ranks[i] = 0;
  }

  this.killer1     = 0;
  this.killer2     = 0;
  this.mateKiller  = 0;
  this.numMoves    = 0;         //  number of pseudo-legal moves for this node.
  this.sortedIndex = 0;         //  index to next selection-sorted pseudo-legal move.
  this.hashMove    = 0;         //  loaded when we look up the tt.
  this.base        = 0;         //  move type base (e.g. good capture) - can be used for LMR.

  this.C_runningEvalS = 0;      // cached before move generation and restored after each unmakeMove.
  this.C_runningEvalE = 0;
  this.C_rights       = 0;
  this.C_ep           = 0;
  this.C_repLo        = 0;
  this.C_repHi        = 0;
  this.C_loHash       = 0;
  this.C_hiHash       = 0;
  this.C_ploHash      = 0;
  this.C_phiHash      = 0;

  this.toZ = 0;                 // move to square index (captures) to piece list - cached during make|unmakeMove.
  this.frZ = 0;                 // move from square index to piece list          - ditto.
  this.epZ = 0;                 // captured ep pawn index to piece list          - ditto.
}

//}}}
//{{{  .init
//
//  By storing the killers in the node, we are implicitly using depth from root, rather than
//  depth, which can jump around all over the place and is inappropriate to use for killers.
//

lozNode.prototype.init = function() {

  this.killer1      = 0;
  this.killer2      = 0;
  this.mateKiller   = 0;
  this.numMoves     = 0;
  this.sortedIndex  = 0;
  this.hashMove     = 0;
  this.base         = 0;

  this.toZ = 0;
  this.frZ = 0;
  this.epZ = 0;
}

//}}}
//{{{  .cache
//
// We cache the board before move generation (those elements not done in unmakeMove)
// and restore after each unmakeMove.
//

lozNode.prototype.cache = function() {

  var board = this.board;

  this.C_runningEvalS = board.runningEvalS;
  this.C_runningEvalE = board.runningEvalE
  this.C_rights       = board.rights;
  this.C_ep           = board.ep;
  this.C_repLo        = board.repLo;
  this.C_repHi        = board.repHi;
  this.C_loHash       = board.loHash;
  this.C_hiHash       = board.hiHash;
  this.C_ploHash      = board.ploHash;
  this.C_phiHash      = board.phiHash;
}

//}}}
//{{{  .uncache

lozNode.prototype.uncache = function() {

  var board = this.board;

  board.runningEvalS   = this.C_runningEvalS;
  board.runningEvalE   = this.C_runningEvalE;
  board.rights         = this.C_rights;
  board.ep             = this.C_ep;
  board.repLo          = this.C_repLo;
  board.repHi          = this.C_repHi;
  board.loHash         = this.C_loHash;
  board.hiHash         = this.C_hiHash;
  board.ploHash        = this.C_ploHash;
  board.phiHash        = this.C_phiHash;
}

//}}}
//{{{  .getNextMove

lozNode.prototype.getNextMove = function () {

  if (this.sortedIndex == this.numMoves)
    return 0;

  var maxR = -INFINITY;
  var maxI = 0;

  for (var i=this.sortedIndex; i < this.numMoves; i++) {
    if (this.ranks[i] > maxR) {
      maxR = this.ranks[i];
      maxI = i;
    }
  }

  var maxM = this.moves[maxI]

  this.moves[maxI] = this.moves[this.sortedIndex];
  this.ranks[maxI] = this.ranks[this.sortedIndex];

  this.base = maxR;

  this.sortedIndex++;

  return maxM;
}

//}}}
//{{{  .addSlide

lozNode.prototype.addSlide = function (move) {

  var n = this.numMoves++;

  this.moves[n] = move;

  if (move == this.hashMove)
    this.ranks[n] = BASE_HASH;

  else if (move == this.mateKiller)
    this.ranks[n] = BASE_MATEKILLER;

  else if (move == this.killer1)
    this.ranks[n] = BASE_MYKILLERS + 1;

  else if (move == this.killer2)
    this.ranks[n] = BASE_MYKILLERS;

  else if (this.grandparentNode && move == this.grandparentNode.killer1)
    this.ranks[n] = BASE_GPKILLERS + 1;

  else if (this.grandparentNode && move == this.grandparentNode.killer2)
    this.ranks[n] = BASE_GPKILLERS;

  else
    this.ranks[n] = this.slideBase(move);
}

//}}}
//{{{  .slideBase

lozNode.prototype.slideBase = function (move) {

    var to      = (move & MOVE_TO_MASK)    >>> MOVE_TO_BITS;
    var fr      = (move & MOVE_FR_MASK)    >>> MOVE_FR_BITS;
    var frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
    var frPiece = frObj & PIECE_MASK;
    var frCol   = frObj & COLOR_MASK;

    if (frCol == WHITE) {
      var pst = WM_PST[frPiece];
      var his = this.board.wHistory[frPiece][to];
    }
    else {
      var pst = BM_PST[frPiece];
      var his = this.board.bHistory[frPiece][to];
    }

    if (!his)
      return BASE_PSTSLIDE + pst[to] - pst[fr];

    else
      return BASE_HISSLIDE + his;
}

//}}}
//{{{  .addCastle

lozNode.prototype.addCastle = function (move) {

  var n = this.numMoves++;

  this.moves[n] = move;

  if (move == this.hashMove)
    this.ranks[n] = BASE_HASH;

  else if (move == this.mateKiller)
    this.ranks[n] = BASE_MATEKILLER;

  else if (move == this.killer1)
    this.ranks[n] = BASE_MYKILLERS + 1;

  else if (move == this.killer2)
    this.ranks[n] = BASE_MYKILLERS;

  else if (this.grandparentNode && move == this.grandparentNode.killer1)
    this.ranks[n] = BASE_GPKILLERS + 1;

  else if (this.grandparentNode && move == this.grandparentNode.killer2)
    this.ranks[n] = BASE_GPKILLERS;

  else
    this.ranks[n] = BASE_CASTLING;
}

//}}}
//{{{  .addCapture

lozNode.prototype.addCapture = function (move) {

  var n = this.numMoves++;

  this.moves[n] = move;

  if (move == this.hashMove)
    this.ranks[n] = BASE_HASH;

  else {

    var victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    var attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim > attack)
      this.ranks[n] = BASE_GOODTAKES + victim * 64 - attack;

    else if (victim == attack)
      this.ranks[n] = BASE_EVENTAKES + victim * 64 - attack;

    else {

      if (move == this.mateKiller)
        this.ranks[n] = BASE_MATEKILLER;

      else if (move == this.killer1)
        this.ranks[n] = BASE_MYKILLERS + 1;

      else if (move == this.killer2)
        this.ranks[n] = BASE_MYKILLERS;

      else if (this.grandparentNode && move == this.grandparentNode.killer1)
        this.ranks[n] = BASE_GPKILLERS + 1;

      else if (this.grandparentNode && move == this.grandparentNode.killer2)
        this.ranks[n] = BASE_GPKILLERS;

      else
        this.ranks[n] = BASE_BADTAKES  + victim * 64 - attack;
    }
  }
}

//}}}
//{{{  .addPromotion

var QPRO = (QUEEN-2)  << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
var RPRO = (ROOK-2)   << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
var BPRO = (BISHOP-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
var NPRO = (KNIGHT-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;

lozNode.prototype.addPromotion = function (move) {

  var n = 0;

  n             = this.numMoves++;
  this.moves[n] = move | QPRO;
  if ((move | QPRO) == this.hashMove)
    this.ranks[n] = BASE_HASH;
  else
    this.ranks[n] = BASE_PROMOTES + QUEEN;

  n             = this.numMoves++;
  this.moves[n] = move | RPRO;
  if ((move | RPRO) == this.hashMove)
    this.ranks[n] = BASE_HASH;
  else
    this.ranks[n] = BASE_PROMOTES + ROOK;

  n             = this.numMoves++;
  this.moves[n] = move | BPRO;
  if ((move | BPRO) == this.hashMove)
    this.ranks[n] = BASE_HASH;
  else
    this.ranks[n] = BASE_PROMOTES + BISHOP;

  n             = this.numMoves++;
  this.moves[n] = move | NPRO;
  if ((move | NPRO) == this.hashMove)
    this.ranks[n] = BASE_HASH;
  else
    this.ranks[n] = BASE_PROMOTES + KNIGHT;
}

//}}}
//{{{  .addEPTake

lozNode.prototype.addEPTake = function (move) {

  var n = this.numMoves++;

  this.moves[n] = move | MOVE_EPTAKE_MASK;

  if ((move | MOVE_EPTAKE_MASK) == this.hashMove)
    this.ranks[n] = BASE_HASH;
  else
    this.ranks[n] = BASE_EPTAKES;
}

//}}}
//{{{  .addQMove

lozNode.prototype.addQMove = function (move) {

  var n = this.numMoves++;

  this.moves[n] = move;

  if (move & MOVE_PROMOTE_MASK)
    this.ranks[n] = BASE_PROMOTES + ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS); // QRBN.

  else if (move & MOVE_EPTAKE_MASK)
    this.ranks[n] = BASE_EPTAKES;

  else {
    var victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    var attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim > attack)
      this.ranks[n] = BASE_GOODTAKES + victim * 64 - attack;

    else if (victim == attack)
      this.ranks[n] = BASE_EVENTAKES + victim * 64 - attack;

    else
      this.ranks[n] = BASE_BADTAKES + victim * 64 - attack;
  }
}

//}}}
//{{{  .addQPromotion

lozNode.prototype.addQPromotion = function (move) {

  this.addQMove (move | (QUEEN-2)  << MOVE_PROMAS_BITS);
  this.addQMove (move | (ROOK-2)   << MOVE_PROMAS_BITS);
  this.addQMove (move | (BISHOP-2) << MOVE_PROMAS_BITS);
  this.addQMove (move | (KNIGHT-2) << MOVE_PROMAS_BITS);
}

//}}}
//{{{  .addKiller

lozNode.prototype.addKiller = function (score, move) {

  if (move == this.hashMove)
    return;

  if (move & (MOVE_EPTAKE_MASK | MOVE_PROMOTE_MASK))
    return;  // before killers in move ordering.

  if (move & MOVE_TOOBJ_MASK) {

    var victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    var attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim >= attack)
      return; // before killers in move ordering.
  }

  if (score >= MINMATE && score <= MATE) {
    this.mateKiller = move;
    if (this.killer1 == move)
      this.killer1 = 0;
    if (this.killer2 == move)
      this.killer2 = 0;
    return;
  }

  if (this.killer1 == move || this.killer2 == move) {
    return;
  }

  if (this.killer1 == 0) {
    this.killer1 = move;
    return;
  }

  if (this.killer2 == 0) {
    this.killer2 = move;
    return;
  }

  var tmp      = this.killer1;
  this.killer1 = move;
  this.killer2 = tmp;
}

//}}}

//}}}
//{{{  lozStats class

//{{{  lozStats

function lozStats () {
}

//}}}
//{{{  .init

lozStats.prototype.init = function () {

  this.startTime = Date.now();
  this.splitTime = 0;
  this.nodes     = 0;  // per analysis
  this.ply       = 0;  // current ID root ply
  this.splits    = 0;
  this.moveTime  = 0;
  this.maxNodes  = 0;
  this.timeOut   = 0;
  this.selDepth  = 0;
  this.bestMove  = 0;
}

//}}}
//{{{  .lazyUpdate

lozStats.prototype.lazyUpdate = function () {

  if (this.moveTime > 0 && ((Date.now() - this.startTime) > this.moveTime))
    this.timeOut = 1;

  if (this.maxNodes > 0 && this.nodes >= this.maxNodes)
    this.timeOut = 1;

  if (Date.now() - this.splitTime > 500) {
    this.splits++;
    this.update();
    this.splitTime = Date.now();
  }
}

//}}}
//{{{  .nodeStr

lozStats.prototype.nodeStr = function () {

  var tim = Date.now() - this.startTime;
  var nps = (this.nodes * 1000) / tim | 0;

  return 'nodes ' + this.nodes + ' time ' + tim + ' nps ' + nps;
}

//}}}
//{{{  .update

lozStats.prototype.update = function () {

  var tim = Date.now() - this.startTime;
  var nps = (this.nodes * 1000) / tim | 0;

  lozza.uci.send('info',this.nodeStr());
}

//}}}
//{{{  .stop

lozStats.prototype.stop = function () {

  this.stopTime  = Date.now();
  this.time      = this.stopTime - this.startTime;
  this.timeSec   = Math.round(this.time / 100) / 10;
  this.nodesMega = Math.round(this.nodes / 100000) / 10;
}

//}}}

//}}}
//{{{  lozUCI class

//{{{  lozUCI

function lozUCI () {

  this.message   = '';
  this.tokens    = [];
  this.command   = '';
  this.spec      = {};
  this.debugging = true;
  this.nodefs    = 0;
  this.numMoves  = 0;

  this.options = {};
}

//}}}
//{{{  .post

lozUCI.prototype.post = function (s) {

  if (lozzaHost == HOST_NODEJS)          // or jxCore.
    this.nodefs.writeSync(1, s + '\n');

  else if (lozzaHost == HOST_JSUCI)
    postMessage(s);

  else if (lozzaHost == HOST_WEB)
    postMessage(s);

  else
    console.log(s);                      // for debug w/o worker.
}

//}}}
//{{{  .send

lozUCI.prototype.send = function () {

  var s = '';

  for (var i = 0; i < arguments.length; i++)
    s += arguments[i] + ' ';

  this.post(s);
}

//}}}
//{{{  .debug

lozUCI.prototype.debug = function () {

  if (!this.debugging)
    return;

  var s = '';

  for (var i = 0; i < arguments.length; i++)
    s += arguments[i] + ' ';

  s = s.trim();

  if (s)
    this.post('info string debug ' + this.spec.id + ' ' + s);
  else
    this.post('info string debug ');
}

//}}}
//{{{  .getInt

lozUCI.prototype.getInt = function (key, def) {

  for (var i=0; i < this.tokens.length; i++)
    if (this.tokens[i] == key)
      if (i < this.tokens.length - 1)
        return parseInt(this.tokens[i+1]);

  return def;
}

//}}}
//{{{  .getStr

lozUCI.prototype.getStr = function (key, def) {

  for (var i=0; i < this.tokens.length; i++)
    if (this.tokens[i] == key)
      if (i < this.tokens.length - 1)
        return this.tokens[i+1];

  return def;
}

//}}}
//{{{  .getArr

lozUCI.prototype.getArr = function (key, to) {

  var lo = 0;
  var hi = 0;

  for (var i=0; i < this.tokens.length; i++) {
    if (this.tokens[i] == key) {
      lo = i + 1;  //assumes at least one item
      hi = lo;
      for (var j=lo; j < this.tokens.length; j++) {
        if (this.tokens[j] == to)
          break;
        hi = j;
      }
    }
  }

  return {lo:lo, hi:hi};
}

//}}}
//{{{  .onmessage

onmessage = function(e) {

  var uci = lozza.uci;

  uci.messageList = e.data.split('\n');

  for (var messageNum=0; messageNum < uci.messageList.length; messageNum++ ) {

    uci.message = uci.messageList[messageNum].replace(/(\r\n|\n|\r)/gm,"");
    uci.message = uci.message.trim();
    uci.message = uci.message.replace(/\s+/g,' ');

    uci.tokens  = uci.message.split(' ');
    uci.command = uci.tokens[0];

    if (!uci.command)
      continue;

    //{{{  shorthand
    
    if (uci.command == 'u')
      uci.command = 'ucinewgame';
    
    if (uci.command == 'b')
      uci.command = 'board';
    
    if (uci.command == 'q')
      uci.command = 'quit';
    
    if (uci.command == 'p') {
      uci.command = 'position';
      if (uci.tokens[1] == 's') {
        uci.tokens[1] = 'startpos';
      }
    }
    
    if (uci.command == 'g') {
      uci.command = 'go';
      if (uci.tokens[1] == 'd') {
        uci.tokens[1] = 'depth';
      }
    }
    
    //}}}

    switch (uci.command) {

    case 'position':
      //{{{  position
      
      uci.spec.board    = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
      uci.spec.turn     = 'w';
      uci.spec.rights   = 'KQkq';
      uci.spec.ep       = '-';
      uci.spec.hmc      = 0;
      uci.spec.fmc      = 1;
      uci.spec.id       = '';
      
      var arr = uci.getArr('fen','moves');
      
      if (arr.lo > 0) { // handle partial FENs
        if (arr.lo <= arr.hi) uci.spec.board  =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) uci.spec.turn   =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) uci.spec.rights =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) uci.spec.ep     =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) uci.spec.hmc    = parseInt(uci.tokens[arr.lo]); arr.lo++;
        if (arr.lo <= arr.hi) uci.spec.fmc    = parseInt(uci.tokens[arr.lo]); arr.lo++;
      }
      
      uci.spec.moves = [];
      
      var arr = uci.getArr('moves','fen');
      
      if (arr.lo > 0) {
        for (var i=arr.lo; i <= arr.hi; i++)
          uci.spec.moves.push(uci.tokens[i]);
      }
      
      lozza.position();
      
      break;
      
      //}}}

    case 'go':
      //{{{  go
      
      if (!uci.spec.board) {
        uci.send('info string send a position command first and a ucinewgame before that if you need to reset the hash');
        return;
      }
      
      uci.spec.depth     = uci.getInt('depth',0);
      uci.spec.moveTime  = uci.getInt('movetime',0);
      uci.spec.maxNodes  = uci.getInt('nodes',0);
      uci.spec.wTime     = uci.getInt('wtime',0);
      uci.spec.bTime     = uci.getInt('btime',0);
      uci.spec.wInc      = uci.getInt('winc',0);
      uci.spec.bInc      = uci.getInt('binc',0);
      uci.spec.movesToGo = uci.getInt('movestogo',0);
      
      uci.numMoves++;
      
      lozza.go();
      
      break;
      
      //}}}

    case 'ucinewgame':
      //{{{  ucinewgame
      
      lozza.newGameInit();
      
      break;
      
      //}}}

    case 'quit':
      //{{{  quit
      
      if (lozzaHost == HOST_NODEJS)
        process.exit();
      else
        close();
      
      break;
      
      //}}}

    case 'debug':
      //{{{  debug
      
      if (uci.getStr('debug','off') == 'on')
        uci.debugging = true;
      else
        uci.debugging = false;
      
      break;
      
      //}}}

    case 'uci':
      //{{{  uci
      
      uci.send('id name Lozza',BUILD);
      uci.send('id author Colin Jenkins');
      uci.send('option');
      uci.send('uciok');
      
      break;
      
      //}}}

    case 'isready':
      //{{{  isready
      
      uci.send('readyok');
      
      break;
      
      //}}}

    case 'setoption':
      //{{{  setoption
      
      var key = uci.getStr('name');
      var val = uci.getStr('value');
      
      uci.options[key] = val;
      
      break;
      
      //}}}

    case 'ping':
      //{{{  ping
      
      uci.send('info string Lozza build',BUILD,HOSTS[lozzaHost],'is alive');
      
      break;
      
      //}}}

    case 'id':
      //{{{  id
      
      uci.spec.id = uci.tokens[1];
      
      break;
      
      //}}}

    case 'perft':
      //{{{  perft
      
      uci.spec.depth = uci.getInt('depth',0);
      uci.spec.moves = uci.getInt('moves',0);
      uci.spec.inner = uci.getInt('inner',0);
      
      lozza.perft();
      
      break;
      
      //}}}

    case 'eval':
      //{{{  eval
      
      lozza.board.verbose = true;
      lozza.board.evaluate(lozza.board.turn);
      //lozza.board.evaluate(lozza.board.turn);  //  uses pawn hash.
      lozza.board.verbose = false;
      
      break;
      
      //}}}

    case 'board':
      //{{{  board
      
      uci.send('board',lozza.board.fen());
      
      break;
      
      //}}}

    default:
      //{{{  ?
      
      uci.send('info string','unknown command',uci.command);
      
      break;
      
      //}}}
    }
  }
}

//}}}

//}}}

//if (lozzaHost == HOST_NODEJS) {
  //%NeverOptimizeFunction(lozBoard.prototype.ttInit);
//}

var lozza         = new lozChess()
lozza.board.lozza = lozza;

//{{{  node.js

if (lozzaHost == HOST_NODEJS) {

  lozza.uci.nodefs = require('fs');

  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      onmessage({data: chunk});
    }
  });

  process.stdin.on('end', function() {
    process.exit();
  });
}

//}}}

