/**
 * Check for typo and inconsistencies within README.md
 * Written by davidhcefx, 2022.3.13.
 */
const fs = require('fs');

/**
 * @returns {Set.<String>} English track names
 */
function getTrackList() {
  const tracks = fs.readFileSync('Tracklist_zh.md', { encoding: 'utf8' })
    .split('\n')
    .map((ln) => ln.split('|'))
    .filter((row) => row.length >= 4 && !row[1].includes('--'))
    .map((row) => row[2].trim());
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

function check() {
  const readme = fs.readFileSync('README.md', { encoding: 'utf8' });
  const trackList = getTrackList();
  const modeList = getModes(readme);

  readme.split(/\n## .+\n/).forEach((story) => {  // each story consists of multiple chapters
    const numSeen = new Set();

    story.split('\n').forEach((line) => {
      // TODO: change to parsing tables
      // - also verify the chapter ranges

      const item = line.match(/^-\s+(\d+-\d+)\s*:\s*([^(\s].*\))\s*\((.+)\)$/);
      if (item) {
        const [, num, track, mode] = item;

        // each numbering (eg. '10-3') should be unique
        if (numSeen.has(num)) {
          throw Error(`The number '${num}' has appeared more than once!`);
        }
        numSeen.add(num);
        // each track should belongs to trackList
        if (!trackList.has(track)) {
          throw Error(`Track name '${track}' does not belong to 'Tracklist_zh.md'`);
        }
        // each mode should belongs to modeList
        if (!modeList.has(mode)) {
          throw Error(`Unrecognized mode name '${mode}' in: ${line}`);
        }
      }
    });
  });
  console.log('All seems well!');
}

check();
