let startup = () => {
  _setEnvironmentVariables();
  _setBrowserPolicies();
  _generateAccounts();
};

var _setEnvironmentVariables = () => Modules.server.setEnvironmentVariables();

var _setBrowserPolicies = () => {
  BrowserPolicy.content.allowOriginForAll( '*.giphy.com' );
  BrowserPolicy.content.allowOriginForAll( '*.wikia.com' );
};

var _generateAccounts = () => Modules.server.generateAccounts();

Modules.server.startup = startup;
