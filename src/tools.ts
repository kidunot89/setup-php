import * as utils from './utils';

/**
 * Function to get command to setup tool
 *
 * @param os_version
 */
export async function getArchiveCommand(os_version: string): Promise<string> {
  switch (os_version) {
    case 'linux':
    case 'darwin':
      return 'add_tool ';
    case 'win32':
      return 'Add-Tool ';
    default:
      return await utils.log(
        'Platform ' + os_version + ' is not supported',
        os_version,
        'error'
      );
  }
}

/**
 * Function to get command to setup tools using composer
 *
 * @param os_version
 */
export async function getPackageCommand(os_version: string): Promise<string> {
  switch (os_version) {
    case 'linux':
    case 'darwin':
      return 'add_composer_tool ';
    case 'win32':
      return 'Add-Composer-Tool ';
    default:
      return await utils.log(
        'Platform ' + os_version + ' is not supported',
        os_version,
        'error'
      );
  }
}

/**
 *
 * Function to get command to setup PECL
 *
 * @param os_version
 */
export async function getPECLCommand(os_version: string): Promise<string> {
  switch (os_version) {
    case 'linux':
    case 'darwin':
      return 'add_pecl ';
    case 'win32':
      return 'Add-PECL ';
    default:
      return await utils.log(
        'Platform ' + os_version + ' is not supported',
        os_version,
        'error'
      );
  }
}

/**
 * Function to get tool version
 *
 * @param version
 */
export async function getToolVersion(version: string): Promise<string> {
  // semver_regex - https://semver.org/
  const semver_regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  version = version.replace(/[><=^]*/, '');
  switch (true) {
    case semver_regex.test(version):
      return version;
    default:
      return 'latest';
  }
}

/**
 * Function to parse tool:version
 *
 * @param release
 */
export async function parseTool(
  release: string
): Promise<{name: string; version: string}> {
  const parts: string[] = release.split(':');
  const tool: string = parts[0];
  const version: string | undefined = parts[1];
  switch (version) {
    case undefined:
      return {
        name: tool,
        version: 'latest'
      };
    default:
      return {
        name: tool,
        version: await getToolVersion(parts[1])
      };
  }
}

/**
 * Function to get the url of tool with the given version
 *
 * @param version
 * @param prefix
 * @param version_prefix
 * @param verb
 */
export async function getUri(
  tool: string,
  extension: string,
  version: string,
  prefix: string,
  version_prefix: string,
  verb: string
): Promise<string> {
  switch (version) {
    case 'latest':
      return [prefix, version, verb, tool + extension]
        .filter(Boolean)
        .join('/');
    default:
      return [prefix, verb, version_prefix + version, tool + extension]
        .filter(Boolean)
        .join('/');
  }
}

/**
 * Helper function to get the codeception url
 *
 * @param version
 * @param suffix
 */
export async function getCodeceptionUriBuilder(
  version: string,
  suffix: string
): Promise<string> {
  return ['releases', version, suffix, 'codecept.phar']
    .filter(Boolean)
    .join('/');
}

/**
 * Function to get the codeception url
 *
 * @param version
 * @param php_version
 */
export async function getCodeceptionUri(
  version: string,
  php_version: string
): Promise<string> {
  const codecept: string = await getCodeceptionUriBuilder(version, '');
  const codecept54: string = await getCodeceptionUriBuilder(version, 'php54');
  const codecept56: string = await getCodeceptionUriBuilder(version, 'php56');
  // Refer to https://codeception.com/builds
  switch (true) {
    case /latest/.test(version):
      switch (true) {
        case /5\.6|7\.[0|1]/.test(php_version):
          return 'php56/codecept.phar';
        case /7\.[2-4]/.test(php_version):
        default:
          return 'codecept.phar';
      }
    case /(^[4-9]|\d{2,})\..*/.test(version):
      switch (true) {
        case /5\.6|7\.[0|1]/.test(php_version):
          return codecept56;
        case /7\.[2-4]/.test(php_version):
        default:
          return codecept;
      }
    case /(^2\.[4-5]\.\d+|^3\.[0-1]\.\d+).*/.test(version):
      switch (true) {
        case /5\.6/.test(php_version):
          return codecept54;
        case /7\.[0-4]/.test(php_version):
        default:
          return codecept;
      }
    case /^2\.3\.\d+.*/.test(version):
      switch (true) {
        case /5\.[4-6]/.test(php_version):
          return codecept54;
        case /^7\.[0-4]$/.test(php_version):
        default:
          return codecept;
      }
    case /(^2\.(1\.([6-9]|\d{2,}))|^2\.2\.\d+).*/.test(version):
      switch (true) {
        case /5\.[4-5]/.test(php_version):
          return codecept54;
        case /5.6|7\.[0-4]/.test(php_version):
        default:
          return codecept;
      }
    case /(^2\.(1\.[0-5]|0\.\d+)|^1\.[6-8]\.\d+).*/.test(version):
      return codecept;
    default:
      return await codecept;
  }
}

/**
 * Helper function to get script to setup phive
 *
 * @param tool
 * @param version
 * @param url
 * @param os_version
 */
export async function addPhive(
  version: string,
  os_version: string
): Promise<string> {
  switch (version) {
    case 'latest':
      return (
        (await getArchiveCommand(os_version)) +
        'https://phar.io/releases/phive.phar phive'
      );
    default:
      return (
        (await getArchiveCommand(os_version)) +
        'https://github.com/phar-io/phive/releases/download/' +
        version +
        '/phive-' +
        version +
        '.phar phive'
      );
  }
}

/**
 * Function to get the PHPUnit url
 *
 * @param version
 */
export async function getPhpunitUrl(
  tool: string,
  version: string
): Promise<string> {
  const phpunit = 'https://phar.phpunit.de';
  switch (version) {
    case 'latest':
      return phpunit + '/' + tool + '.phar';
    default:
      return phpunit + '/' + tool + '-' + version + '.phar';
  }
}

/**
 * Function to get the Deployer url
 *
 * @param version
 */
export async function getDeployerUrl(version: string): Promise<string> {
  const deployer = 'https://deployer.org';
  switch (version) {
    case 'latest':
      return deployer + '/deployer.phar';
    default:
      return deployer + '/releases/v' + version + '/deployer.phar';
  }
}

/**
 * Function to get the Deployer url
 *
 * @param version
 * @param os_version
 */
export async function getSymfonyUri(
  version: string,
  os_version: string
): Promise<string> {
  let filename = '';
  switch (os_version) {
    case 'linux':
    case 'darwin':
      filename = 'symfony_' + os_version + '_amd64';
      break;
    case 'win32':
      filename = 'symfony_windows_amd64.exe';
      break;
    default:
      return await utils.log(
        'Platform ' + os_version + ' is not supported',
        os_version,
        'error'
      );
  }
  switch (version) {
    case 'latest':
      return 'releases/latest/download/' + filename;
    default:
      return 'releases/download/v' + version + '/' + filename;
  }
}

/**
 * Function to add/move composer in the tools list
 *
 * @param tools
 */
export async function addComposer(tools_list: string[]): Promise<string[]> {
  const regex = /^composer($|:.*)/;
  const composer: string = tools_list.filter(tool => regex.test(tool))[0];
  switch (composer) {
    case undefined:
      break;
    default:
      tools_list = tools_list.filter(tool => !regex.test(tool));
      break;
  }
  tools_list.unshift('composer');
  return tools_list;
}

/**
 * Function to get Tools list after cleanup
 *
 * @param tools_csv
 */
export async function getCleanedToolsList(
  tools_csv: string
): Promise<string[]> {
  let tools_list: string[] = await utils.CSVArray(tools_csv);
  tools_list = await addComposer(tools_list);
  tools_list = tools_list
    .map(function(extension: string) {
      return extension
        .trim()
        .replace(/robmorgan\/|hirak\/|narrowspark\/automatic-/, '');
    })
    .filter(Boolean);
  return [...new Set(tools_list)];
}

/**
 * Helper function to get script to setup a tool using a phar url
 *
 * @param tool
 * @param version
 * @param url
 * @param os_version
 */
export async function addArchive(
  tool: string,
  version: string,
  url: string,
  os_version: string
): Promise<string> {
  return (await getArchiveCommand(os_version)) + url + ' ' + tool;
}

/**
 * Function to get the script to setup php-config and phpize
 *
 * @param tool
 * @param os_version
 */
export async function addDevTools(
  tool: string,
  os_version: string
): Promise<string> {
  switch (os_version) {
    case 'linux':
      return (
        'add_devtools' +
        '\n' +
        (await utils.addLog('$tick', tool, 'Added', 'linux'))
      );
    case 'darwin':
      return await utils.addLog('$tick', tool, 'Added', 'darwin');
    case 'win32':
      return await utils.addLog(
        '$cross',
        tool,
        tool + ' is not a windows tool',
        'win32'
      );
    default:
      return await utils.log(
        'Platform ' + os_version + ' is not supported',
        os_version,
        'error'
      );
  }
}

/**
 * Helper function to get script to setup a tool using composer
 *
 * @param tool
 * @param release
 * @param prefix
 * @param os_version
 */
export async function addPackage(
  tool: string,
  release: string,
  prefix: string,
  os_version: string
): Promise<string> {
  const tool_command = await getPackageCommand(os_version);
  return tool_command + tool + ' ' + release + ' ' + prefix;
}

/**
 * Setup tools
 *
 * @param tool_csv
 * @param os_version
 */
export async function addTools(
  tools_csv: string,
  php_version: string,
  os_version: string
): Promise<string> {
  let script = '\n' + (await utils.stepLog('Setup Tools', os_version));
  const tools_list: Array<string> = await getCleanedToolsList(tools_csv);
  await utils.asyncForEach(tools_list, async function(release: string) {
    const tool_data: {name: string; version: string} = await parseTool(release);
    const tool: string = tool_data.name;
    const version: string = tool_data.version;
    const github = 'https://github.com/';
    let uri: string = await getUri(
      tool,
      '.phar',
      version,
      'releases',
      '',
      'download'
    );
    script += '\n';
    let url = '';
    switch (tool) {
      case 'cs2pr':
        uri = await getUri(tool, '', version, 'releases', '', 'download');
        url = github + 'staabm/annotate-pull-request-from-checkstyle/' + uri;
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'php-cs-fixer':
        uri = await getUri(tool, '.phar', version, 'releases', 'v', 'download');
        url = github + 'FriendsOfPHP/PHP-CS-Fixer/' + uri;
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'phpcs':
      case 'phpcbf':
        url = github + 'squizlabs/PHP_CodeSniffer/' + uri;
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'phive':
        script += await addPhive(version, os_version);
        break;
      case 'phpstan':
        url = github + 'phpstan/phpstan/' + uri;
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'phpmd':
        url = github + 'phpmd/phpmd/' + uri;
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'psalm':
        url = github + 'vimeo/psalm/' + uri;
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'composer':
        url =
          github + 'composer/composer/releases/latest/download/composer.phar';
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'codeception':
        url =
          'https://codeception.com/' +
          (await getCodeceptionUri(version, php_version));
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'phpcpd':
      case 'phpunit':
        url = await getPhpunitUrl(tool, version);
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'deployer':
        url = await getDeployerUrl(version);
        script += await addArchive(tool, version, url, os_version);
        break;
      case 'phinx':
        script += await addPackage(tool, release, 'robmorgan/', os_version);
        break;
      case 'prestissimo':
        script += await addPackage(tool, release, 'hirak/', os_version);
        break;
      case 'composer-prefetcher':
        script += await addPackage(
          tool,
          release,
          'narrowspark/automatic-',
          os_version
        );
        break;
      case 'pecl':
        script += await getPECLCommand(os_version);
        break;
      case 'php-config':
      case 'phpize':
        script += await addDevTools(tool, os_version);
        break;
      case 'symfony':
      case 'symfony-cli':
        uri = await getSymfonyUri(version, os_version);
        url = github + 'symfony/cli/' + uri;
        script += await addArchive('symfony', version, url, os_version);
        break;
      default:
        script += await utils.addLog(
          '$cross',
          tool,
          'Tool ' + tool + ' is not supported',
          os_version
        );
        break;
    }
  });

  return script;
}
