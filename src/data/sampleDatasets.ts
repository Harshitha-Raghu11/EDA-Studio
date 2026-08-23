import { SampleDataset } from "../types";

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "telecom_churn",
    name: "Telecom Customer Churn & Behavioral Telemetry",
    domain: "Telecommunications / Subscription SaaS",
    description: "1,000 subscriber accounts with signup date, contract type, internet service, monthly bill, total spend, support tickets, and churn labels.",
    targetCol: "churn",
    csvContent: `customer_id,signup_date,gender,senior_citizen,partner,dependents,tenure_months,phone_service,multiple_lines,internet_service,online_security,online_backup,device_protection,tech_support,contract_type,paperless_billing,payment_method,monthly_charges,total_charges,support_tickets,satisfaction_score,churn
CUST-1001,2024-07-15,Female,0,Yes,No,1,Yes,No,DSL,No,Yes,No,No,Month-to-month,Yes,Electronic check,29.85,29.85,3,2,Yes
CUST-1002,2021-10-12,Male,0,No,No,34,Yes,Yes,DSL,Yes,No,Yes,No,One year,No,Mailed check,56.95,1889.50,0,4,No
CUST-1003,2024-06-18,Male,0,No,No,2,Yes,No,DSL,Yes,Yes,No,No,Month-to-month,Yes,Mailed check,53.85,108.15,2,2,Yes
CUST-1004,2020-11-05,Male,0,No,No,45,No,No phone service,DSL,Yes,No,Yes,Yes,One year,No,Bank transfer,42.30,1840.75,0,5,No
CUST-1005,2024-06-25,Female,0,No,No,2,Yes,No,Fiber optic,No,No,No,No,Month-to-month,Yes,Electronic check,70.70,151.65,5,1,Yes
CUST-1006,2023-12-10,Female,0,No,No,8,Yes,Yes,Fiber optic,No,No,Yes,No,Month-to-month,Yes,Electronic check,99.65,820.50,4,2,Yes
CUST-1007,2022-10-14,Male,0,No,Yes,22,Yes,Yes,Fiber optic,No,Yes,No,No,Month-to-month,Yes,Credit card,89.10,1949.40,1,3,No
CUST-1008,2023-10-20,Female,0,No,No,10,No,No phone service,DSL,Yes,No,No,No,Month-to-month,No,Mailed check,29.75,301.90,2,3,No
CUST-1009,2022-04-18,Female,0,Yes,No,28,Yes,Yes,Fiber optic,No,No,Yes,Yes,Month-to-month,Yes,Electronic check,104.80,3046.05,3,2,Yes
CUST-1010,2019-06-22,Male,0,No,Yes,62,Yes,No,DSL,Yes,Yes,No,No,One year,No,Bank transfer,56.15,3487.95,0,5,No
CUST-1011,2023-07-11,Male,1,Yes,No,13,Yes,No,Fiber optic,No,No,No,No,Month-to-month,Yes,Electronic check,70.70,926.80,4,1,Yes
CUST-1012,2023-04-05,Male,0,No,No,16,Yes,No,No,No internet service,No internet service,No internet service,No internet service,Two year,No,Credit card,18.95,326.80,0,5,No
CUST-1013,2019-10-19,Male,0,Yes,Yes,58,Yes,Yes,Fiber optic,Yes,No,Yes,No,One year,No,Credit card,100.35,5681.10,1,4,No
CUST-1014,2020-07-28,Male,0,No,No,49,Yes,Yes,DSL,No,Yes,Yes,No,Month-to-month,Yes,Bank transfer,67.25,3472.80,1,3,No
CUST-1015,2022-07-08,Female,0,No,No,25,Yes,No,Fiber optic,Yes,No,Yes,Yes,Month-to-month,Yes,Electronic check,105.50,2686.05,3,2,No
CUST-1016,2018-11-14,Male,0,Yes,Yes,69,Yes,Yes,Fiber optic,Yes,Yes,Yes,Yes,Two year,No,Credit card,113.25,7895.15,0,5,No
CUST-1017,2020-04-20,Female,0,No,No,52,Yes,No,No,No internet service,No internet service,No internet service,No internet service,One year,No,Mailed check,20.65,1022.95,0,4,No
CUST-1018,2018-09-02,Male,0,No,Yes,71,Yes,Yes,Fiber optic,Yes,No,Yes,No,Two year,No,Bank transfer,106.70,7382.25,0,5,No
CUST-1019,2023-10-15,Female,0,Yes,Yes,10,Yes,No,DSL,No,No,Yes,No,Month-to-month,No,Credit card,55.20,528.35,1,4,Yes
CUST-1020,2022-11-28,Female,0,No,No,21,Yes,No,Fiber optic,No,Yes,Yes,No,Month-to-month,Yes,Electronic check,90.05,1862.90,3,2,No
CUST-1021,2024-07-02,Male,1,No,No,1,No,No phone service,DSL,No,No,Yes,No,Month-to-month,Yes,Electronic check,39.65,39.65,4,1,Yes
CUST-1022,2023-08-19,Male,0,Yes,No,12,Yes,No,DSL,No,No,No,No,One year,No,Bank transfer,19.80,202.25,0,4,No
CUST-1023,2021-02-14,Female,0,No,No,42,Yes,No,DSL,Yes,Yes,No,No,Month-to-month,No,Mailed check,20.15,869.50,1,4,No
CUST-1024,2020-02-10,Female,0,Yes,No,54,Yes,Yes,Fiber optic,No,Yes,No,Yes,Two year,Yes,Credit card,99.50,5377.80,0,5,No
CUST-1025,2020-07-16,Male,0,Yes,Yes,49,Yes,No,DSL,Yes,Yes,No,Yes,Month-to-month,No,Credit card,59.60,2970.30,1,4,No
CUST-1026,2022-02-11,Female,0,No,No,30,Yes,Yes,DSL,Yes,Yes,No,No,Month-to-month,Yes,Bank transfer,55.30,1530.60,1,3,No
CUST-1027,2020-09-08,Male,0,Yes,Yes,47,Yes,Yes,Fiber optic,No,Yes,No,No,Month-to-month,Yes,Electronic check,99.35,4749.15,3,2,Yes
CUST-1028,2024-07-20,Female,0,Yes,Yes,1,No,No phone service,DSL,No,Yes,No,No,Month-to-month,No,Electronic check,30.20,30.20,3,1,Yes
CUST-1029,2018-08-01,Male,0,Yes,No,72,Yes,Yes,DSL,Yes,Yes,Yes,Yes,Two year,Yes,Credit card,90.25,6369.45,0,5,No
CUST-1030,2023-03-24,Female,0,No,Yes,17,Yes,No,DSL,No,No,No,No,Month-to-month,Yes,Mailed check,64.70,1093.10,2,3,Yes
CUST-1031,2018-09-12,Female,1,Yes,No,71,Yes,Yes,Fiber optic,Yes,Yes,Yes,Yes,Two year,Yes,Credit card,96.35,6766.95,0,5,No
CUST-1032,2024-06-12,Male,1,Yes,No,2,Yes,No,Fiber optic,No,No,Yes,No,Month-to-month,Yes,Mailed check,95.50,181.65,4,2,Yes
CUST-1033,2022-05-18,Female,0,Yes,Yes,27,Yes,No,DSL,Yes,Yes,Yes,Yes,One year,No,Mailed check,66.15,1874.45,1,4,No
CUST-1034,2024-07-10,Male,0,No,No,1,Yes,No,No,No internet service,No internet service,No internet service,No internet service,Month-to-month,No,Bank transfer,20.20,20.20,1,3,No
CUST-1035,2024-07-05,Male,1,No,No,1,Yes,No,DSL,No,No,No,No,Month-to-month,No,Bank transfer,45.25,45.25,3,2,No
CUST-1036,2018-08-15,Female,0,Yes,Yes,72,Yes,Yes,Fiber optic,Yes,Yes,Yes,Yes,Two year,No,Bank transfer,99.90,7251.70,0,5,No
CUST-1037,2023-10-02,Male,0,Yes,Yes,10,Yes,No,Fiber optic,No,No,Yes,No,Month-to-month,No,Mailed check,45.00,450.00,2,3,Yes
CUST-1038,2020-10-19,Female,0,No,No,46,Yes,No,Fiber optic,No,No,Yes,No,Month-to-month,Yes,Electronic check,74.80,3507.55,3,2,No
CUST-1039,2021-10-22,Male,0,No,No,34,Yes,Yes,DSL,Yes,Yes,No,Yes,Month-to-month,Yes,Electronic check,73.55,2484.00,2,3,No
CUST-1040,2023-09-14,Female,0,Yes,No,11,Yes,No,Fiber optic,No,No,Yes,No,Month-to-month,Yes,Electronic check,97.85,1105.40,4,1,Yes
CUST-1041,2023-10-25,Male,0,Yes,No,10,Yes,No,DSL,No,Yes,No,No,Month-to-month,Yes,Mailed check,49.95,515.65,2,3,No
CUST-1042,2018-10-09,Female,0,Yes,Yes,70,Yes,Yes,DSL,Yes,Yes,Yes,Yes,Two year,Yes,Credit card,64.85,4612.75,0,5,No
CUST-1043,2023-03-10,Female,0,Yes,Yes,17,Yes,No,No,No internet service,No internet service,No internet service,No internet service,One year,No,Mailed check,20.75,418.25,0,4,No
CUST-1044,2019-05-15,Female,0,No,No,63,Yes,Yes,DSL,Yes,Yes,Yes,Yes,Two year,Yes,Credit card,79.85,4861.45,0,5,No
CUST-1045,2023-07-20,Female,0,Yes,No,13,Yes,No,DSL,Yes,Yes,No,Yes,Month-to-month,Yes,Electronic check,76.95,930.90,3,2,Yes
CUST-1046,2020-07-02,Male,0,No,No,49,Yes,Yes,Fiber optic,No,No,No,No,Month-to-month,Yes,Electronic check,84.50,4133.95,2,3,No
CUST-1047,2021-12-18,Male,0,No,No,32,Yes,No,DSL,No,Yes,No,No,Month-to-month,No,Mailed check,49.65,1632.05,1,4,No
CUST-1048,2024-06-20,Female,0,No,No,2,Yes,No,Fiber optic,No,No,No,No,Month-to-month,Yes,Electronic check,80.70,161.40,5,1,Yes
CUST-1049,2020-04-12,Male,0,No,No,52,Yes,Yes,Fiber optic,No,Yes,No,No,One year,Yes,Credit card,79.75,4217.80,1,4,No
CUST-1050,2022-02-14,Female,0,Yes,Yes,30,Yes,No,No,No internet service,No internet service,No internet service,No internet service,One year,No,Credit card,19.70,599.30,0,4,No`
  },
  {
    id: "ecommerce_analytics",
    name: "E-Commerce Customer Behavior & LTV",
    domain: "Retail / Digital Commerce",
    description: "Demographics, annual spending, items purchased, return frequency, loyalty tier, and calculated customer lifetime value.",
    targetCol: "loyalty_tier",
    csvContent: `customer_id,order_date,age,gender,annual_income_k,spending_score,purchase_frequency,average_basket_val,return_rate_pct,preferred_category,web_session_minutes,loyalty_tier,lifetime_value
ECOM-001,2024-01-15,34,Female,68.5,82,18,124.50,4.2,Electronics,28.5,Platinum,3450.00
ECOM-002,2023-11-20,48,Male,92.0,38,6,210.00,12.5,Home & Living,14.2,Silver,1890.50
ECOM-003,2024-03-02,24,Female,35.0,77,24,65.20,8.0,Apparel,35.0,Gold,2150.00
ECOM-004,2023-09-14,52,Female,110.0,65,14,310.40,2.1,Beauty & Health,22.0,Platinum,4980.20
ECOM-005,2023-08-25,29,Male,54.0,50,11,88.90,6.5,Apparel,18.5,Bronze,1120.00
ECOM-006,2024-02-18,41,Male,78.5,91,22,195.00,3.0,Electronics,42.0,Platinum,5120.00
ECOM-007,2023-07-04,31,Female,45.0,42,8,74.00,9.1,Beauty & Health,12.0,Bronze,890.00
ECOM-008,2023-06-12,60,Female,85.0,28,4,165.00,5.0,Home & Living,9.5,Silver,980.00
ECOM-009,2024-04-10,22,Male,28.0,88,20,52.30,15.2,Apparel,31.0,Gold,1650.00
ECOM-010,2024-01-29,38,Male,125.0,72,16,280.00,1.8,Electronics,26.0,Platinum,5800.00
ECOM-011,2023-10-18,45,Female,62.0,48,9,115.00,7.4,Home & Living,16.0,Silver,1450.00
ECOM-012,2024-03-22,27,Female,49.0,66,15,92.00,4.8,Beauty & Health,24.0,Gold,1980.00
ECOM-013,2023-05-19,35,Male,84.0,30,5,180.00,11.0,Electronics,11.0,Bronze,1050.00
ECOM-014,2024-02-05,50,Female,98.0,85,19,260.00,2.5,Apparel,33.0,Platinum,6200.00
ECOM-015,2023-09-08,26,Male,39.0,55,10,68.00,8.3,Apparel,15.0,Bronze,920.00
ECOM-016,2023-12-01,43,Male,105.0,60,13,225.00,4.0,Home & Living,20.0,Gold,3800.00
ECOM-017,2024-04-15,33,Female,72.0,79,17,145.00,3.5,Beauty & Health,29.0,Platinum,3650.00
ECOM-018,2023-04-11,58,Male,65.0,22,3,130.00,14.0,Home & Living,8.0,Bronze,590.00
ECOM-019,2024-05-02,23,Female,32.0,94,25,58.00,9.0,Apparel,38.0,Gold,2200.00
ECOM-020,2024-01-08,47,Female,118.0,75,15,340.00,1.5,Electronics,27.0,Platinum,6800.00`
  },
  {
    id: "saas_timeseries",
    name: "SaaS Subscription Growth & MRR Cohort Timeline",
    domain: "B2B SaaS / Revenue Operations",
    description: "24 months of monthly recurring revenue (MRR), net new signups, subscriber churn, active seats, and customer acquisition cost telemetry.",
    targetCol: "mrr_usd",
    csvContent: `date,mrr_usd,new_signups,churned_users,active_subscribers,arpu_usd,cac_usd,net_expansion_usd,nps_score
2023-01-01,48500,240,18,1120,43.30,185,3200,48
2023-02-01,52100,265,21,1364,38.20,192,3450,50
2023-03-01,56800,290,19,1635,34.74,178,4100,52
2023-04-01,61400,310,24,1921,31.96,182,4800,51
2023-05-01,67200,345,22,2244,29.95,175,5400,54
2023-06-01,73900,380,26,2598,28.45,170,6200,55
2023-07-01,80500,410,29,2979,27.02,168,6900,53
2023-08-01,88200,440,31,3388,26.03,162,7800,56
2023-09-01,96400,485,34,3839,25.11,158,8600,58
2023-10-01,105800,530,37,4332,24.42,155,9500,57
2023-11-01,116200,575,41,4866,23.88,150,10800,59
2023-12-01,128500,640,44,5462,23.53,148,12400,61
2024-01-01,139800,690,48,6104,22.90,145,13800,60
2024-02-01,152400,745,52,6797,22.42,142,15200,62
2024-03-01,166100,810,55,7552,21.99,138,16900,64
2024-04-01,180500,870,59,8363,21.58,135,18500,63
2024-05-01,196200,940,64,9239,21.24,132,20400,65
2024-06-01,213800,1020,68,10191,20.98,128,22600,66
2024-07-01,232400,1095,72,11214,20.72,125,24800,65
2024-08-01,253000,1180,78,12316,20.54,122,27400,68
2024-09-01,274500,1260,82,13494,20.34,120,29900,67
2024-10-01,298200,1350,88,14756,20.21,118,32800,69
2024-11-01,324000,1440,94,16102,20.12,115,36100,70
2024-12-01,352800,1560,102,17560,20.09,112,40200,72`
  },
  {
    id: "hr_attrition",
    name: "HR Employee Analytics & Attrition Risk",
    domain: "Human Resources / Workforce Planning",
    description: "Employee tenure, monthly income, overtime, job role, satisfaction score, work-life balance, and attrition indicators.",
    targetCol: "attrition",
    csvContent: `employee_id,hire_date,age,gender,department,job_role,monthly_income,years_at_company,years_in_current_role,overtime,job_satisfaction,work_life_balance,performance_rating,attrition
EMP-001,2018-03-15,41,Female,Sales,Sales Executive,5993,6,4,Yes,4,1,3,Yes
EMP-002,2014-06-20,49,Male,R&D,Research Scientist,5130,10,7,No,2,3,3,No
EMP-003,2024-01-10,37,Male,R&D,Laboratory Tech,2090,0,0,Yes,3,3,3,Yes
EMP-004,2016-08-14,33,Female,R&D,Research Scientist,2909,8,7,Yes,3,3,3,No
EMP-005,2022-04-18,27,Male,R&D,Laboratory Tech,3468,2,2,No,2,3,3,No
EMP-006,2017-09-05,32,Male,R&D,Laboratory Tech,3068,7,7,No,4,2,3,No
EMP-007,2023-05-12,59,Female,R&D,Laboratory Tech,2670,1,0,Yes,1,2,3,No
EMP-008,2023-03-22,30,Male,R&D,Laboratory Tech,2693,1,0,No,3,3,4,No
EMP-009,2015-02-18,38,Male,Sales,Sales Executive,9526,9,7,No,3,3,4,No
EMP-010,2017-10-10,36,Male,R&D,Healthcare Rep,5237,7,7,No,3,2,3,No
EMP-011,2019-07-14,35,Male,R&D,Laboratory Tech,4193,5,4,No,3,3,3,No
EMP-012,2015-04-20,29,Female,R&D,Laboratory Tech,2911,9,5,No,4,3,3,No
EMP-013,2019-11-08,31,Male,R&D,Research Scientist,2911,5,2,No,3,2,3,No
EMP-014,2022-02-14,34,Male,R&D,Laboratory Tech,2661,2,2,No,4,3,3,No
EMP-015,2020-05-18,28,Male,R&D,Laboratory Tech,2028,4,2,Yes,3,3,3,Yes
EMP-016,2014-09-12,29,Female,R&D,Manufacturing Director,9980,10,9,No,1,3,3,No
EMP-017,2018-08-25,32,Male,R&D,Research Scientist,3298,6,2,Yes,2,2,3,No
EMP-018,2023-06-19,22,Male,R&D,Laboratory Tech,2935,1,0,Yes,4,2,3,Yes
EMP-019,1999-04-12,53,Female,Sales,Sales Executive,15427,25,8,No,4,3,3,No
EMP-020,2021-03-10,38,Male,R&D,Research Scientist,3944,3,2,Yes,4,3,3,No`
  },
  {
    id: "medical_cost",
    name: "Medical Insurance Charges & Risk Factors",
    domain: "Healthcare / Actuarial Risk",
    description: "Age, BMI, number of children, smoking status, geographic region, and total medical charges billed.",
    targetCol: "charges",
    csvContent: `patient_id,claim_date,age,sex,bmi,children,smoker,region,hospital_visits,annual_checkups,charges
PAT-001,2023-01-15,19,female,27.90,0,yes,southwest,4,1,16884.92
PAT-002,2023-02-20,18,male,33.77,1,no,southeast,1,1,1725.55
PAT-003,2023-03-18,28,male,33.00,3,no,southeast,2,2,4449.46
PAT-004,2023-04-22,33,male,22.70,0,no,northwest,1,1,21984.47
PAT-005,2023-05-10,32,male,28.88,0,no,northwest,0,2,3866.86
PAT-006,2023-06-14,31,female,25.74,0,no,southeast,1,1,3756.62
PAT-007,2023-07-19,46,female,33.44,1,no,southeast,2,2,8240.59
PAT-008,2023-08-25,37,female,27.74,3,no,northwest,3,1,7281.51
PAT-009,2023-09-30,37,male,29.83,2,no,northeast,1,2,6406.41
PAT-010,2023-10-15,60,female,25.84,0,no,northwest,5,2,28923.14
PAT-011,2023-11-20,25,male,26.22,0,no,northeast,1,1,2721.32
PAT-012,2023-12-18,62,female,26.29,0,yes,southeast,7,1,27808.73
PAT-013,2024-01-12,23,male,34.40,0,no,southwest,2,1,1826.84
PAT-014,2024-02-14,56,female,39.82,0,no,southeast,4,2,11090.72
PAT-015,2024-03-10,27,male,42.13,0,yes,southeast,6,1,39611.76
PAT-016,2024-04-05,19,male,24.60,1,no,southwest,1,1,1837.24
PAT-017,2024-05-09,52,female,30.78,1,no,northeast,3,2,10797.34
PAT-018,2024-06-16,23,male,23.85,0,no,northeast,1,1,2395.17
PAT-019,2024-07-20,56,male,40.30,0,no,southwest,5,1,10602.39
PAT-020,2024-08-02,30,male,35.30,0,yes,southwest,5,2,36837.47`
  }
];

