/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const ElectronicHealthRecordContract = require('./lib/electronic_health_record_contract');

module.exports.ElectronicHealthRecordContract = ElectronicHealthRecordContract;
module.exports.contracts = [ ElectronicHealthRecordContract ];