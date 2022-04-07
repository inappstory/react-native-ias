const fs = require('fs');
const fsExtra = require('fs-extra');
const os = require('os');

const ROOT_PACKAGE_JSON_PATH = '../../package.json';
const SDK_PACKAGE_JSON_PATH = './package.json';

function detectNewline(source) {
  var cr   = source.split("\r").length;
  var lf   = source.split("\n").length;
  var crlf = source.split("\r\n").length;

  if ( cr + lf === 0 ) {
    return "NONE";
  }

  if ( crlf === cr && crlf === lf ) {
    return "CRLF";
  }

  if (cr > lf) {
    return "CR";
  } else {
    return "LF";
  }
}

function insertNativeDependencies() {
  try {

    const data = fs.readFileSync(ROOT_PACKAGE_JSON_PATH, 'utf8');

    let EOL = os.EOL;
    const detectedEOL = detectNewline(data);
    if (detectedEOL === 'CR') {
      EOL = '\r';
    } else if (detectedEOL === 'LF') {
      EOL = '\n';
    } else if (detectedEOL === 'CRLF') {
      EOL = '\r\n';
    }

    const re = new RegExp(EOL);
    const nameRow = data.split(re).find(el => el.includes(`"name"`));
    let spaces = 2;
    if (nameRow != null) {
      spaces = nameRow.split(`"name"`)[0].length;
    }

    const rootPackageJson = fsExtra.readJsonSync(ROOT_PACKAGE_JSON_PATH);
    const sdkPackageJson = fsExtra.readJsonSync(SDK_PACKAGE_JSON_PATH);

    const sdkNativeDependencies = sdkPackageJson.nativeDependencies;
    const sdkDependencies = sdkPackageJson.dependencies;
    const nativeDeps = sdkNativeDependencies.reduce(
      (o, dep) => ({ ...o, [dep]: sdkDependencies[dep] }),
      {},
    );

    const newPackageJson = {
      ...rootPackageJson,
      dependencies: {
        ...rootPackageJson.dependencies,
        ...nativeDeps,
      },
    };

    fsExtra.writeJsonSync(ROOT_PACKAGE_JSON_PATH, newPackageJson, { spaces, EOL });
    // eslint-disable-next-line no-console
    console.log(
      '[ias-rn] - native dependencies added to root package.json',
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(
      `[ias-rn] - error adding dependencies to root package.json\n${e.message}`,
    );
    return;
  }
}

// eslint-disable-next-line no-console
console.log('[ias-rn] - adding native dependencies to root package.json');

insertNativeDependencies();
