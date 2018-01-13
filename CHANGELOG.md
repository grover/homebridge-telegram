# Changelog

## 0.1.0

### Urgencies now replaced with switches for individual notification groups

The previous way of handling notifications and urgencies led to race conditions
and wrong messages being sent when urgencies were switched. This issue is resolved
with this change, which also enables easier triggering of the proper messages
from rules.

With this change urgencies are now plain text and do not have to be numeric.

### Reporting telegram connectivity via Reachable characteristic

HomeKits BridgingStatus service and Reachable characteristic enable reporting
of the backend connectivity status. The accessory now reports the status of
the telegram connection, which is sadly not used by the Home app (as of iOS
11.2.) The reachable characteristic is evaluated by the Elgato Eve app.

### Failed characteristic removed

The introduction of the Reachability characteristic has removed the need for the 
previously available Failed characteristic.

### Urgency characteristic removed

With the new way of sending messages from predefined groups, the previous use of
urgencies has been removed.

## 0.0.7

- Fixed a bug that prevented changing the urgency
