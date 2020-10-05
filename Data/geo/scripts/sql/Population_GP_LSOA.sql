/*
Script returns GP Registered Populations by LSOA
Data is produced quarterly (Jan, Apr, Jul, Oct)
Note: A separate query is produced to return the CCG overall view, 'All'

*/

select a.period
  ,a.practice_code
  ,a.lsoa
  ,a.population
from lsoa_gp_pop a
  join gp_practice gp on a.practice_code = gp.organisation_code::text
  join lsoa_national_2011 lsoa on a.lsoa = lsoa.lsoa11cd::text
where gp.provider_purchaser::text = '03Q'
::text and gp.status_code::text = 'A'::text and a.sex = 'ALL'::text and a.population > 20::numeric


union

select a.period
  ,'All'
  ,a.lsoa
  ,sum(a.population) as "population"
from lsoa_gp_pop a
  join gp_practice gp on a.practice_code = gp.organisation_code::text
  join lsoa_national_2011 lsoa on a.lsoa = lsoa.lsoa11cd::text
where gp.provider_purchaser::text = '03Q'
::text and gp.status_code::text = 'A'::text and a.sex = 'ALL'::text and a.population > 20::numeric
group by a.period, a.lsoa
