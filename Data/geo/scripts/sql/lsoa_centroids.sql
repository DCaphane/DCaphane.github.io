/*
Returns lsoa centroids for selected lsoas (population over 50)

*/
with
    popnlsoa
    as
    (
        select distinct a.lsoa
        from lsoa_gp_pop a
            join gp_practice gp
            on a.practice_code = gp.organisation_code::text
            join lsoa_national_2011 lsoa
            on a.lsoa = lsoa.lsoa11cd::text
        where gp.provider_purchaser::text = '03Q'::text
           and gp.status_code::text = 'A'::text
           and a.sex = 'ALL'::text
           and a.population > 20::numeric
       )
select lc.lsoa11cd
    ,lc.geom
from gis.lsoa_popn_centroid_geo_2011 lc
    join gis.lsoa_ccg_stp_202004 ccg
    on lc.lsoa11cd = ccg.lsoa11cd
    join popnlsoa p
    on lc.lsoa11cd = p.lsoa
