---
title: ogr2ogr
output: geojson scripts
---

# ogr2ogr scripts

> to generate geojson files without going via qgis

Open OSGeo4W and paste the following commands to generate the appropriate geojson files.

### Command line parameters

| Command | Description |
| --- | --- |
| -nln | name in metadata|
| -lco DESCRIPTION | description in metadata |
| PG:"" | Postgres Connection |
| --optfile | standard default options |

Additionally supply an output file and source data table *or* sql/ sql file


## primary_care_networks.geojson

*default options*

``` OSGeo4W
ogr2ogr -nln "Primary Care Networks" -lco DESCRIPTION="PCNs and GP Practice Main Site" "P:\Users\david.caphane1\Dropbox\d3\ECDS\Data\geo\pcn\primary_care_networks.geojson" PG:"user='postgres' active_schema=gis" gis.primary_care_networks --optfile "P:\Users\david.caphane1\Dropbox\d3\ECDS\Data\geo\scripts\options.txt"
```

## primary_care_network_sites.geojson

*default options and sql file*

``` OSGeo4W
ogr2ogr -nln "Primary Care Networks and GP Sites" -lco DESCRIPTION="PCNs and GP Sites" "P:\Users\david.caphane1\Dropbox\d3\ECDS\Data\geo\pcn\primary_care_network_sites.geojson" PG:"user='postgres' active_schema=gis" -sql @"P:\Users\david.caphane1\Dropbox\d3\ECDS\Data\geo\scripts\sql\pcn_sites.sql" --optfile "P:\Users\david.caphane1\Dropbox\d3\ECDS\Data\geo\scripts\options.txt"
```
