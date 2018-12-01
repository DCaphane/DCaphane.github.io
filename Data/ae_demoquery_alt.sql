
/*
Starting records: 37,274
Link to diagnosis table (needs refreshing...): 37,274
Link to diagnosis descriptions: 37,274 (need to account for duplicate snomed id in ref table)


To Consider:
	Firsts only?
	Suburst for ECDS_Diagnosis_Group1 to 3 and diagnosis?



	Y:\VOYCCG\Contracting\00 Analysis & Information\Analysis\AE Activity\National Reports\Reasons_for_ED_Attd_ACross_YandH.pdf
	see table 1 for list of  investigations, treatments and disposal categories identifying unnecessary ED attendances
*/

/*
-- Disposal Descriptions
if OBJECT_ID('tempdb..#AE_Disposal', 'U') is not null
	drop table #AE_Disposal;

create table #AE_Disposal
(
    Disposal_Code             varchar(2)   not null
    ,Disposal_Description      varchar(255) not null
    ,Disposal_Description_Abbr varchar(255) not null
        primary key (Disposal_Code)
);

insert into #AE_Disposal
    (
    Disposal_Code
    , Disposal_Description
    , Disposal_Description_Abbr
    )
values
    ('01' ,'Admitted to a Hospital Bed /became a LODGED PATIENT of the same Health Care Provider ' ,'Admitted')
    ,('02' ,'Discharged - follow up treatment to be provided by GENERAL PRACTITIONER ' ,'Discharged - GP Follow Up')
    ,('03' ,'Discharged - did not require any follow up treatment' ,'Discharged - No Follow Up')
    ,('04' ,'Referred to A&E Clinic' ,'Referred - A&E')
    ,('05' ,'Referred to Fracture Clinic' ,'Referred - Fracture Clinic')
    ,('06' ,'Referred to other Out-Patient Clinic ' ,'Referred - Outpatient Clinic')
    ,('07' ,'Transferred to other Health Care Provider ' ,'Transferred to Other Provider')
    ,('10' ,'Died in Department' ,'Died')
    ,('11' ,'Referred to other health CARE PROFESSIONAL ' ,'Transferred to Other Health Care Professional')
    ,('12' ,'Left Department before being seen for treatment' ,'Left before being seen for treatment')
    ,('13' ,'Left Department having refused treatment' ,'Left refusing treatment')
    ,('14' ,'Other' ,'Other');
*/



select cast(arrival_date as datetime) + cast(arrival_time as datetime) as 'Arrival_DateTime'
  -- ,dateadd(minute, isnull(Duration_in_Min, 60), cast(0 as datetime)) as 'Duration' -- format as datetime for nice formatting... Suspect 24 hours is too long (unless zoom is an option)
     ,isnull(Duration_in_Min, 60) * 1000 * 60 as 'Duration_ms' -- deafults to 60 mins if not submitted
    -- , Generated_Record_ID -- for validation only
	-- , left(Week_Day, 3) as 'WeekDay' -- derive at source
	-- , bh.Bank_Holiday_Desc as 'BankHolidays' -- derive as source
	 -- ,case
	-- when Week_Day in (
	-- 		'Sat'
	-- 		, 'Sun'
	-- 		)
	-- 	then 1 -- 'W/E BHol'
	-- when bh.Bank_Holiday_Desc is not null
	-- 	then 2 -- 'W/E BHol'
	-- else 0 -- 'Weekday'
	-- end as 'WE_BH'
	 -- ,case
     --    when [IN_OUT_Business_Hours] = 'In_Business_Hours' then 0 -- with extended access, might need to re-consider this
     --    when [IN_OUT_Business_Hours] = 'Out_Business_Hours' then 1
     --    when [IN_OUT_Business_Hours] = 'Public Holiday' then 2
     --    when [IN_OUT_Business_Hours] = 'Weekend' then 3
     --    else 9 end as 'IN_OUT_Business_Hours'
	 ,case
		when age_at_admission < 85 then
			right(('00' + left([5year_Band], charindex('-', [5year_Band], 1) - 1)), 2) + '-'
			+ right('00' + right([5year_Band], len([5year_Band]) - charindex('-', [5year_Band], 1)), 2)
		when nullif(age_at_admission, '999') is null then '40-44' -- arbitrary default group for unknown
		when age_at_admission > 84 then '85+'
		end as 'AgeBand' -- formatted to enable sorting
     ,isnull(main.[Emergency Care Attendance Source SNOMED CT], 0) as 'snomed_attd'
     --,attd.ECDS_Group as 'Attendance_Source_Group'
     --,attd.ECDS_Description as 'Attendance_Source_Description'
	--,disch.[ECDS_Group] as 'Discharge_Group'
    --,disch.[ECDS_Description] as 'Discharge_Description'
     ,isnull(diag.[Emergency Care Diagnosis SNOMED CT], 0) as 'snomed_diagnosis'
    /* -- All the diag fields below can be generated from the snomed code with a ref table
    -- looking into this for speed
	 ,diagGrp.ECDS_Group1
	 ,diagGrp.ECDS_Group2
	 ,diagGrp.ECDS_Group3
	 ,diagGrp.ECDS_Description
	 ,diagGrp.SNOMED_Description
	 ,[Diagnosis_Description1]
     */
     ,isnull(main.[Emergency Care Chief Complaint SNOMED CT], 0) as 'snomed_complaint'
	 --,complaint.[ECDS_Group] as 'Complaint_Group'
     --,complaint.[ECDS_Description] as 'Complaint_Description'
	 ,isnull(main.[Emergency Care Acuity SNOMED CT], 0) as 'snomed_acuity'
	 --,isnull(acuity.ECDS_Description, '0 - Invalid ') as 'Acuity_ECDS'
	--, isnull(acuity.SNOMED_Description, 'check') as 'Acuity_Snomed'
	/* not well populated
	, inj_activity.[ECDS_Group] as 'Injury_Group'
    , inj_activity.[ECDS_Description] as 'Injury_Description'
	*/
    ,isnull(InjDrug.[Emergency Care Injury Alcohol Or Drug Involvment SNOMED CT], 0)  as 'snomed_injdrug'
	 --,refInjDrug.[ECDS_Group] as 'InjDrug_Group'
     --,refInjDrug.[ECDS_Description] as 'InjDrug_Description'
	-- Discharge Details
	 -- ,d.Disposal_Description_Abbr -- old method, drop this
     ,isnull(main.[Emergency Care Discharge Status SNOMED CT], 0) as 'snomed_dischargestatus'
	  --,ds.ECDS_Group as 'Discharge_Status_Group'
	  --,ds.ECDS_Description as 'Discharge_Status_Description'
      ,isnull(main.[Emergency Care Discharge Destination SNOMED CT], 0) as 'snomed_dischargedest'
	  --,dd.ECDS_Group as 'Discharge_Destination_Group'
	  --,dd.ECDS_Description as 'Discharge_Destination_Description'
      ,isnull(main.[Emergency Care Discharge Follow Up SNOMED CT], 0) as 'snomed_dischargeFU'
	  --,df.ECDS_Group as 'Discharge_FollowUp_Group'
	  --,df.ECDS_Description as 'Discharge_FollowUp_Description'
	 ,case
		when Commissioning_Serial_No_Agreement_No = 'c=' then 1
		when Contract_Suffix like '%ECDS%' then 1
		when right(Commissioning_Serial_No_Agreement_No, 1) = '=' then 9
		else 0
		end as 'Comm_Serial'
	 ,practice_code
from [Customer_VOYCCG].[eMBED].[AnalystTableAAELive] ae
    left join [Info-UK-Health-Dimensions].[dbo].[ref_Dates] bh
    on ae.Arrival_Date = bh.Full_Date
    -- left join #AE_Disposal d
    -- on ae.Attendance_Disposal = d.disposal_code
    left join [Customer_VOYCCG].[eMBED].[vw_EC_Diag] diag
    on ae.Generated_Record_ID = diag.[Generated Record Identifier]
    left join [customer].[ref_ec_diagnosis] diagGrp
    on diag.[Emergency Care Diagnosis SNOMED CT] = diagGrp.[SNOMED_Code]

    left join [Customer_VOYCCG].[eMBED].[vw_EC_InjDrug] InjDrug
    on ae.Generated_Record_ID = InjDrug.[Generated Record Identifier]
    left join [customer].[ref_ec_inj_drugAlcohol] refInjDrug
    on InjDrug.[Emergency Care Injury Alcohol Or Drug Involvment SNOMED CT] = refInjDrug.[SNOMED_Code]

    -- Link to main table
    left join [Customer_VOYCCG].[eMBED].[vw_EC_Main] main
    on ae.Generated_Record_ID = main.[Generated Record Identifier]
    left join [customer].[ref_ec_acuity] acuity
    on main.[Emergency Care Acuity SNOMED CT] = acuity.SNOMED_Code
    left join [customer].[ref_ec_chief_complaint] complaint
    on main.[Emergency Care Chief Complaint SNOMED CT] = complaint.SNOMED_Code
    left join [Customer_VOYCCG].[customer].[ref_ec_discharge_status] ds
    on main.[Emergency Care Discharge Status SNOMED CT] = ds.[SNOMED_Code]
    left join [customer].[ref_ec_discharge_destination] dd
    on main.[Emergency Care Discharge Destination SNOMED CT] = dd.SNOMED_Code
    left join [Customer_VOYCCG].[customer].ref_ec_discharge_followup df
    on main.[Emergency Care Discharge Follow Up SNOMED CT] = df.SNOMED_Code
    left join [Customer_VOYCCG].[customer].[ref_ec_attd_source] attd
    on main.[Emergency Care Attendance Source SNOMED CT] = attd.SNOMED_Code
--left join [customer].[ref_ec_inj_activity] inj_activity
--	on main.[Emergency Care Injury Activity Type SNOMED CT] = inj_activity.SNOMED_Code
where
	ae.period between '20171001' and '20180930'
    and (coalesce(nullif(left(ae.CCG_Code, 3), 'X26'), left(ae.provider_purchaser_id, 3)) = '03Q' -- When unknown practice, default to provider purchaser
    or left(ae.provider_purchaser_id, 3) = '03Q')
    and isnull(diag.[dmicSequenceNumber], 1) = 1
    and isnull(InjDrug.[dmicSequenceNumber], 1) = 1
    and (
	(
    ae.contract_suffix in ('ACUTE', 'NCA')
    and left(provider_provider_id, 3) <> 'NLO' -- Northern Doctors
    and Department_Type = '01' -- need to consider type 3 (MIU)
    and PbR_Flag_InYear = 'PbR'
    and right(isnull([Commissioning_Serial_No_Agreement_No], '0'), 1) <> '='
	    )
    or (
        -- ED Front door
        left(ae.provider_provider_id, 3) = 'RCB'
    and (
			ae.contract_suffix = 'EXCLUDED (ECDS Streaming)'
    or isnull(Commissioning_Serial_No_Agreement_No, '') = 'c=')
        )
		)
    ;
