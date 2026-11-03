// source: https://redocly.com/docs/redoc/v3.x/config
// migration from v2: https://redocly.com/docs/redoc/v3.x/config-migration

export interface RedocLogo {
  url?: string;
  backgroundColor?: string;
  altText?: string;
  href?: string;
}

export interface RedocApiLogo {
  imageUrl: string;
  href?: string;
  altText?: string;
  backgroundColor?: string;
}

export interface RedocOptions {
  /**
   * Routing mode for deep links. `hash` keeps the route in the URL fragment. `history` uses path-based URLs and needs
   * a server that returns the page for every path.
   * @default 'hash'
   */
  router?: 'hash' | 'history';
  /**
   * Path prefix the docs are served under. Used to build route URLs with `history` routing.
   * @default '/'
   */
  basePath?: string;
  /**
   * Turns off Redoc's anonymous telemetry when `true`.
   * NestJSRedox disables telemetry by default. Set this to `false` explicitly to enable it.
   * @default true (NestJSRedox default, Redoc's own default is false)
   */
  disableTelemetry?: boolean;
  /**
   * Hides the loading spinner shown while the description loads.
   */
  hideLoading?: boolean;
  /**
   * Skips resolving and bundling `$ref`s. Requires a description object rather than a URL.
   */
  skipBundle?: boolean;
  /**
   * Vertical offset in pixels for pages with a fixed header.
   */
  scrollYOffset?: number;
  /**
   * Sidebar logo. Alternatively use `logo` to set the `x-logo` extension of the OpenAPI document.
   */
  apiLogo?: RedocApiLogo;
  /**
   * Order and labels of request sample language tabs. Redoc does not generate code samples, a tab appears only when
   * `x-codeSamples` provides one.
   */
  codeSamples?: {
    languages: {
      lang: string;
      label?: string;
    }[];
  };
  /**
   * Hides the `pattern` constraint in schema fields.
   */
  hideSchemaPattern?: boolean;
  /**
   * Named schemas shown without their properties where referenced.
   */
  ignoreNamedSchemas?: string[];
  /**
   * Set the URLs used to download the OpenAPI description or other documentation related files.
   */
  downloadUrls?: {
    title?: string;
    url: string;
  }[];
  /**
   * Maximum depth of generated samples.
   * @default 8
   */
  generatedSamplesMaxDepth?: number;
  /**
   * Hides the download buttons. This setting does not make the API definition private.
   */
  hideDownloadButtons?: boolean;
  /**
   * Hides the prefix of nested properties.
   * @default false
   */
  hidePropertiesPrefix?: boolean;
  /**
   * Hides the schema title next to the type.
   */
  hideSchemaTitles?: boolean;
  /**
   * Default expand level for JSON payload samples.
   */
  jsonSamplesExpandLevel?: number | 'all';
  /**
   * Page layout.
   * @default 'three-panel'
   */
  layout?: 'three-panel' | 'stacked';
  /**
   * Displays only the specified number of enum values. The remaining values are hidden in an expandable area.
   * @default 10
   */
  maxDisplayedEnumValues?: number;
  /**
   * Shows only required fields in request samples.
   */
  onlyRequiredInSamples?: boolean;
  /**
   * If set to true, all HTML/Markdown of the API definition is sanitized to prevent XSS.
   */
  sanitize?: boolean;
  /**
   * Shows a tag with all schema definitions using the given name.
   */
  schemaDefinitionsTagName?: string;
  /**
   * Expands schemas up to the given level. `all` expands all levels.
   */
  schemasExpansionLevel?: number | 'all';
  /**
   * Shows specification extensions ('x-' fields). Use true for all or an array of extension names.
   */
  showExtensions?: boolean | string[];
  /**
   * Shows required properties in schemas first, ordered in the same order as in the required array.
   */
  sortRequiredPropsFirst?: boolean;

  /**
   * NestJSRedox helper: groups tags by categories in the side menu (sets `x-tagGroups` in the OpenAPI document).
   */
  tagGroups?: {
    name: string;
    tags: string[];
  }[];
  /**
   * NestJSRedox helper: specifies the API logo (sets `info.x-logo` in the OpenAPI document or `apiLogo` if the document
   * is loaded from an URL).
   */
  logo?: RedocLogo;
}

export const DEFAULT_REDOC_VERSION = '3.0.1';

export class NestJSRedoxOptions {
  // served path on that the redoc is available
  useGlobalPrefix?: boolean = false;
  auth?: {
    enabled?: boolean;
    users: Record<string, string>;
  };
  /**
   * set this if resolving the absolute path to the bundles directory doesn't work. E.g. when using pkg.
   */
  redocBundlesDir?: string;

  /**
   * Enable this if you want to serve your own redoc installation. You have to install redoc as dependency.
   * @default: false
   */
  standalone?: boolean = false;

  /**
   * Redoc version loaded from the CDN (only used if standalone is false). Supported range: ^3.0.0.
   * Set to "3.x" to always load the newest Redoc 3 version or "latest" to load the newest Redoc version (may be a
   * not supported major version).
   * @default: '3.0.1'
   */
  redocVersion?: string = DEFAULT_REDOC_VERSION;

  /**
   * In standalone mode NestJSRedox checks if the installed redoc version is supported (^3.0.0) and throws an error
   * otherwise. Enable this to skip the check.
   * @default: false
   */
  allowUnsupportedRedocVersion?: boolean = false;

  /**
   * Custom CSS added to the page. Redoc 3 is themed using CSS variables, e.g.
   * `:root { --sidebar-width: 222px; }`. See https://redocly.com/docs/realm/branding/css-variables
   */
  customCss?: string;

  /**
   * Overwrites given headers after nestjs-redox set default headers (e.g. content security policy).
   */
  overwriteHeadersWith?: Record<string, string>;

  /**
   * Sets a favicon
   */
  favicon?: {
    url?: string;
  };

  /**
   * By default, the swagger JSON file can be downloaded from a Blob URL only. If you need to access the sagger JSON
   * via URL, use this option.
   */
  serveAPIDoc?: {
    enabled?: boolean;
    filename?: string;
  } = {
    enabled: false,
    filename: 'swagger.json',
  };

  constructor(partial?: Partial<NestJSRedoxOptions>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
