/**
 * This code was generated by
 * \ / _    _  _|   _  _
 *  | (_)\/(_)(_|\/| |(/_  v1.0.0
 *       /       /
 */

import Preview = require('../Preview');
import Version = require('../../base/Version');
import { ExportConfigurationList } from './bulk_exports/exportConfiguration';
import { ExportConfigurationListInstance } from './bulk_exports/exportConfiguration';
import { ExportList } from './bulk_exports/export';
import { ExportListInstance } from './bulk_exports/export';


declare class BulkExports extends Version {
  /**
   * Initialize the BulkExports version of Preview
   *
   * @property exports - exports resource
   * @property exportConfiguration - exportConfiguration resource
   *
   * @param domain - The twilio domain
   */
  constructor(domain: Preview);

  readonly exportConfiguration: ExportConfigurationListInstance;
  readonly exports: ExportListInstance;
}

export = BulkExports;