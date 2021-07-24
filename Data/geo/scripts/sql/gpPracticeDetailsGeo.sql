/*
Returns a list of GP Practice Main and Branch sites
    Sites with an equivalent main code (based on orgCode and  geom) are removed (to prevent duplicate markers)

    H:\GitHub\Remotes\DCaphane.github.io\Data\geo\scripts\sql\gpPracticeDetailsGeo.sql

    OutputPath: \\dc-sys-fil-c015.systems.informatix.loc\VOY_Home\David.Caphane1\GitHub\Remotes\DCaphane.github.io\Data\geo\gpPracticeDetailsGeo.geojson
*/
    select
        '03Q' as "parent"
        ,practice_code as "orgCode"
        ,null as "orgName"
        ,'main' as "type"
        ,pcn_name
        ,geom
    from
        gis.primary_care_networks

union all

    select
        parent_organisation_code as "parent"
        ,organisation_code
        ,organisation_name
        ,'site' as "type"
        ,sites.pcn_name
        ,sites.geom
    from
        gis.gp_practice_sites_geo sites
        left join gis.primary_care_networks main
        on sites.geom = main.geom
            and sites.parent_organisation_code = main.practice_code
    where main.practice_code is null
        and sites.pcn_name is not null
