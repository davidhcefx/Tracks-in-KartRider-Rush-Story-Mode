/**
 * Check for typo and inconsistencies within README.md
 * Written by davidhcefx, 2022.3.13.
 */
const fs = require('fs');
const { XMLHttpRequest } = require('xmlhttprequest');

/**
 * @param {String} tracksFile The filename of tracklist
 * @returns {Set.<String>} Track names in English
 */
function getTracklist(tracksFile) {
  const tracks = fs.readFileSync(tracksFile, { encoding: 'utf8' })
    .split('\n')
    .map((ln) => ln.split('|'))
    .filter((row) => row.length >= 4 && !row[1].includes('--'))
    .map((row) => row[1].trim());
  return new Set(tracks);
}

/**
 * @param {String} readme
 * @returns {Set.<String>} Mode abbreviations
 */
function getModes(readme) {
  const modes = new Set();
  let begin = false;  // detect keyword 'Mode abbreviations'

  readme.split('\n').forEach((line) => {
    if (begin) {
      const match = line.match(/^>\s*\|\s*(\S+)\s*\|.+\|.+\|/);
      if (!match) return;
      modes.add(modes.size === 0 ? '' : match[1]);  // erase first one
    } else if (line.includes('Mode abbreviations')) {
      begin = true;
    }
  });
  modes.add('?');  // allow setting '?' as mode
  return modes;
}

/**
 * @param {String} kartsFile The filename of kartlist
 * @returns {Set.<String>} Kart names
 */
function getKarts(kartsFile) {
  const karts = fs.readFileSync(kartsFile, { encoding: 'utf8' })
    .split('\n')
    .map((ln) => ln.match(/^- (.+?)\s*$/))
    .filter((match) => match)
    .map((match) => match[1]);
  return new Set(karts);
}

/**
 * @param {String} readmeFile The filename of readme
 * @param {String} tracksFile The filename of tracklist
 * @throws An error when some checks failed.
 */
function check(readmeFile, tracksFile) {
  const readme = fs.readFileSync(readmeFile, { encoding: 'utf8' });
  const trackList = getTracklist(tracksFile);
  const modeList = getModes(readme);
  const kartList = getKarts('Karts.md');

  // each story consists of multiple chapters
  readme.split(/\r?\n## .+\r?\n/).slice(1).forEach((story) => {
    // eg. '| 10-3 | Korea Circuit (WKC) | Tr | Monster |'
    const rowRegex = /^\|?\s*([0-9B]+-[0-9]+)\s*\|([^|]+)\|([^|]+)\|?([^|]+)?/;
    const numSeen = new Set();

    story.split('\n').map((line) => line.match(rowRegex)).forEach((row) => {
      if (row) {
        const [, num, track, mode, kart] = row.map((x) => (x ? x.trim() : x));

        // each numbering should be unique
        if (numSeen.has(num)) {
          throw Error(`The number '${num}' has appeared more than once!`);
        }
        numSeen.add(num);

        // each track should belongs to trackList
        if (!trackList.has(track)) {
          throw Error(`Track name '${track}' does not belong to 'Tracklist.md': "${row[0]}"`);
        }

        // each mode should belongs to modeList
        if (!modeList.has(mode)) {
          throw Error(`Unrecognized mode name '${mode}': "${row[0]}"`);
        }

        // each kart name should belongs to kartList
        if (kart && !kartList.has(kart)) {
          throw Error(`Unrecognized kart name: '${kart}'. Please use names on `
              + 'this site (without brackets): https://krrplus.web.app/karts.');
        }
      }
    });
  });
}

check('README.md', 'Tracklist.md');
console.log('All seems well!');
