/* Onward — content data. Edit this file to add, remove, or fix resources.
   Tags:
     d:   which disabilities it is for (omit = everyone)
     age: 'kid' (under 18), 'senior' (65+), omit = everyone
     vet: true = veterans only
     s:   which settings a plan step applies to (omit = all)
*/

const SETTINGS = [
  { id: 'hospital', label: 'In the hospital', icon: '🏥' },
  { id: 'acute',    label: 'In acute (inpatient) rehab', icon: '💪' },
  { id: 'subacute', label: 'In subacute rehab', icon: '🛏️' },
  { id: 'nursing',  label: 'In a nursing home', icon: '🏢' },
  { id: 'home',     label: 'At my own home', icon: '🏠' },
  { id: 'family',   label: "At a relative's or friend's home", icon: '🏡' }
];

const DISABILITIES = [
  { id: 'sci',    label: 'Spinal cord injury' },
  { id: 'ms',     label: 'Multiple sclerosis (MS)' },
  { id: 'als',    label: 'ALS' },
  { id: 'amp',    label: 'Amputation / limb loss' },
  { id: 'stroke', label: 'Stroke' },
  { id: 'tbi',    label: 'Brain injury (TBI)' },
  { id: 'sb',     label: 'Spina bifida' },
  { id: 'nm',     label: 'Muscular dystrophy / neuromuscular' },
  { id: 'cp',     label: 'Cerebral palsy' },
  { id: 'pd',     label: "Parkinson's" },
  { id: 'tm',     label: 'Transverse myelitis / GBS' },
  { id: 'joint',  label: 'Arthritis, joint or bone condition' },
  { id: 'pain',   label: 'Chronic pain or illness' },
  { id: 'vision', label: 'Blind / low vision' },
  { id: 'hearing',label: 'Deaf / hard of hearing' },
  { id: 'other',  label: 'Other mobility disability' },
  { id: 'unsure', label: 'Not sure yet / still being diagnosed' }
];
const MOBILITY = ['sci','ms','als','amp','stroke','tbi','sb','nm','cp','pd','tm','joint','other','unsure'];
const NEURO = ['sci','ms','als','stroke','tbi','sb','nm','cp','pd','tm'];

/* ---------- Find Care categories (searched live from the national provider registry) ---------- */
const CARE = [
  { id: 'scicenter', icon: '♿', title: 'Spinal cord & wheelchair centers',
    desc: 'Federally recognized SCI Model System hospitals, plus spinal cord injury doctors near you.',
    kind: 'idv', codes: ['2081S0010X'], startR: 25, curated: true,
    d: ['sci','tm','sb','ms','other','unsure'],
    maps: 'wheelchair seating clinic' },
  { id: 'irf', icon: '🏥', title: 'Acute inpatient rehab hospitals',
    desc: 'Rehab hospitals and hospital rehab units — intensive therapy, about 3 hours a day.',
    kind: 'org', codes: ['283X00000X','273Y00000X'], startR: 25 },
  { id: 'outpt', icon: '🤸', title: 'Outpatient rehab & therapy',
    desc: 'Clinics for physical, occupational and wheelchair-skills therapy after you go home.',
    kind: 'org', codes: ['261QR0400X','261QR0401X','225100000X','225X00000X'], startR: 10,
    maps: 'neuro rehab outpatient wheelchair' },
  { id: 'pmr', icon: '🩺', title: 'Rehabilitation doctors (physiatrists)',
    desc: 'PM&R doctors lead your rehab, wheelchair prescriptions and long-term care.',
    kind: 'idv', codes: ['208100000X','2081S0010X','2081N0008X','2081H0002X'], startR: 10 },
  { id: 'neurosurg', icon: '🧠', title: 'Spine neurosurgeons',
    desc: 'Neurological surgeons. Call and ask if they focus on the spine.',
    kind: 'idv', codes: ['207T00000X'], startR: 25, d: ['sci','tm','sb','other','unsure','pain','tbi'] },
  { id: 'spineortho', icon: '🦴', title: 'Spine orthopedic surgeons',
    desc: 'Orthopedic surgeons who list spine surgery as their specialty.',
    kind: 'idv', codes: ['207XS0117X'], startR: 25, d: ['sci','joint','other','unsure','pain','sb'] },
  { id: 'neuro', icon: '⚡', title: 'Neurologists',
    desc: 'Doctors for nerve, brain and spinal cord conditions such as MS, ALS and stroke.',
    kind: 'idv', codes: ['2084N0400X'], startR: 10 },
  { id: 'painmd', icon: '🎯', title: 'Pain management doctors',
    desc: 'Pain medicine specialists, including nerve pain after injury.',
    kind: 'idv', codes: ['208VP0000X','208VP0014X','207LP2900X','2081P2900X','2084P2900X'], startR: 10 },
  { id: 'uro', icon: '💧', title: 'Urologists (bladder care)',
    desc: 'Bladder and kidney care — important after spinal cord injury, MS and spina bifida.',
    kind: 'idv', codes: ['208800000X'], startR: 10, d: ['sci','ms','sb','tm','cp','pd'] },
  { id: 'dme', icon: '🦽', title: 'Wheelchair & medical equipment suppliers',
    desc: 'Durable medical equipment suppliers, including custom wheelchair and seating suppliers.',
    kind: 'org', codes: ['332BC3200X','332B00000X'], startR: 10,
    maps: 'complex rehab wheelchair supplier' },
  { id: 'pando', icon: '🦿', title: 'Prosthetics & orthotics',
    desc: 'Prosthetists and orthotists who make limbs, braces and splints.',
    kind: 'org', codes: ['335E00000X'], startR: 25, d: ['amp','sci','cp','stroke','sb','nm','other','unsure'] },
  { id: 'hosp', icon: '🏨', title: 'Hospitals',
    desc: 'General hospitals near you.',
    kind: 'org', codes: ['282N00000X'], startR: 10 },
  { id: 'snf', icon: '🛏️', title: 'Subacute rehab & nursing facilities',
    desc: 'Skilled nursing facilities that offer slower-paced rehab and longer stays.',
    kind: 'org', codes: ['314000000X'], startR: 10 },
  { id: 'homehealth', icon: '🏠', title: 'Home health agencies',
    desc: 'Nurses and therapists who come to your home.',
    kind: 'org', codes: ['251E00000X'], startR: 10 },
  { id: 'diet', icon: '🥗', title: 'Registered dietitians',
    desc: 'Help with weight, nutrition, and bowel and skin health.',
    kind: 'idv', codes: ['133V00000X'], startR: 10 },
  { id: 'ot', icon: '✋', title: 'Occupational therapists',
    desc: 'Help regaining daily skills: dressing, cooking, driving, hand function and returning to work.',
    kind: 'idv', codes: ['225X00000X'], startR: 10 },
  { id: 'psych', icon: '💬', title: 'Psychologists',
    desc: 'Including rehabilitation psychologists, who specialize in adjusting to disability.',
    kind: 'idv', codes: ['103TR0400X','103TC0700X','103TH0100X','103T00000X'], startR: 10 },
  { id: 'family', icon: '👪', title: 'Family & couples counselors',
    desc: 'Marriage and family therapists, counselors and clinical social workers.',
    kind: 'idv', codes: ['106H00000X','101YM0800X','1041C0700X'], startR: 10 },
  { id: 'sud', icon: '🤝', title: 'Substance use treatment',
    desc: 'Treatment programs for alcohol, opioid and other drug dependency.',
    kind: 'org', codes: ['324500000X','261QR0405X'], startR: 10 },
  { id: 'pharm', icon: '💊', title: 'Pharmacies',
    desc: 'Community and retail pharmacies.',
    kind: 'org', codes: ['3336C0003X'], startR: 5 }
];

/* SCI Model System centers — ACL list announced Nov 12, 2026 (FY2026 funding). Phones/sites from MSKTC. */
const SCIMS = [
  { n: 'Craig Hospital — Rocky Mountain Regional Spinal Injury System', c: 'Englewood, CO', z: '80113', ll: [39.641, -104.961], ph: '303-789-8306', w: 'https://craighospital.org' },
  { n: 'Shepherd Center — Southeastern Regional SCI Model System', c: 'Atlanta, GA', z: '30309', ll: [33.798, -84.388], ph: '404-352-2020', w: 'https://www.shepherd.org' },
  { n: 'UAB Spinal Cord Injury Model System', c: 'Birmingham, AL', z: '35233', ll: [33.506, -86.8], ph: '205-934-3283', w: 'https://www.uab.edu/sci/' },
  { n: 'TIRR Memorial Hermann — Texas Model SCI System', c: 'Houston, TX', z: '77030', ll: [29.704, -95.401], ph: '713-797-5972', w: 'https://tirr.memorialhermann.org' },
  { n: 'Santa Clara Valley Medical Center — Northern California SCI Model System', c: 'San Jose, CA', z: '95128', ll: [37.316, -121.936], ph: '408-781-8175', w: 'https://scvmc.scvh.org' },
  { n: 'Rancho Los Amigos — Southern California SCI Model System', c: 'Downey, CA', z: '90242', ll: [33.922, -118.139], ph: '562-385-7177', w: 'https://www.socalscims.org' },
  { n: 'Spaulding Rehabilitation — New England Regional SCI Center', c: 'Boston, MA', z: '02129', ll: [42.378, -71.063], ph: '617-952-6174', w: 'http://snerscic.org' },
  { n: 'University of Washington — Northwest Regional SCI Model System', c: 'Seattle, WA', z: '98104', ll: [47.604, -122.326], ph: '', w: 'https://msktc.org/sci/model-system-centers' },
  { n: 'Kessler Foundation — Northern New Jersey SCI System', c: 'West Orange, NJ', z: '07052', ll: [40.786, -74.257], ph: '973-324-3567', w: 'https://kesslerfoundation.org/NNJSCIS' },
  { n: 'Mount Sinai Spinal Cord Injury Model System', c: 'New York, NY', z: '10029', ll: [40.792, -73.945], ph: '212-659-9369', w: 'http://www.mountsinaisci.org' },
  { n: 'UPMC — University of Pittsburgh Model Center on SCI', c: 'Pittsburgh, PA', z: '15219', ll: [40.442, -79.983], ph: '412-232-7949', w: 'http://www.upmc-sci.pitt.edu' },
  { n: 'University of Miami — South Florida SCI Model System', c: 'Miami, FL', z: '33136', ll: [25.786, -80.204], ph: '305-243-4497', w: 'https://med.miami.edu/programs/sfscims' },
  { n: 'MedStar National Rehabilitation Hospital — National Capital SCI Model System', c: 'Washington, DC', z: '20010', ll: [38.933, -77.032], ph: '202-877-1694', w: 'https://www.medstarnrh.org' },
  { n: 'University of Minnesota — Minnesota Regional SCI Model System', c: 'Minneapolis, MN', z: '55455', ll: [44.974, -93.233], ph: '612-626-2935', w: 'https://mnscims.umn.edu' }
];

/* ---------- Resource directory ---------- */
/* Each: t title, u url, ph phone, x short description, tags as above */
const RESOURCES = [
 { cat: 'community', title: 'Wheelchair & disability community', icon: '♿', items: [
  { t: 'Christopher & Dana Reeve Foundation', u: 'https://www.christopherreeve.org', ph: '1-800-539-7309', x: 'Free information specialists, a peer & family mentoring program, and guides for paralysis.', d: ['sci','ms','tm','stroke','sb','cp','other','unsure','als'] },
  { t: 'United Spinal Association', u: 'https://unitedspinal.org', x: 'Membership group for wheelchair users: local chapters, peer support, advocacy, resource center.', d: MOBILITY },
  { t: 'New Mobility magazine', u: 'https://newmobility.com', x: 'Real-life articles by and for wheelchair users — work, travel, sex, equipment, life.', d: MOBILITY },
  { t: 'Facing Disability', u: 'https://facingdisability.com', x: 'Thousands of short videos of people with spinal cord injuries and their families answering real questions.', d: ['sci','tm'] },
  { t: 'MSKTC — Model Systems fact sheets', u: 'https://msktc.org', x: 'Free, research-based plain-language fact sheets and videos on SCI, brain injury and burns.', d: ['sci','tbi','tm','unsure'] },
  { t: 'SCI-Info Pages', u: 'https://www.sci-info-pages.com', x: 'Large collection of spinal cord injury information and resource links.', d: ['sci','tm'] },
  { t: 'Wheelchair Skills Program', u: 'https://wheelchairskillsprogram.ca', x: 'Free videos and manuals for learning wheelchair skills — curbs, wheelies, transfers.', d: MOBILITY },
  { t: 'Unite 2 Fight Paralysis', u: 'https://u2fp.org', x: 'Community following cure and recovery research for spinal cord injury.', d: ['sci','tm'] },
  { t: 'Triumph Foundation', u: 'https://triumph-foundation.org', x: 'Peer support, grants and events for people with spinal cord injury.', d: ['sci','tm'] },
  { t: 'Ms. Wheelchair America', u: 'https://www.mswheelchairamerica.org', x: 'Women wheelchair users leading advocacy and community.', d: MOBILITY },
  { t: 'Apparelyzed forum', u: 'https://www.apparelyzed.com', x: 'Long-running peer forum for spinal cord injury and paralysis.', d: ['sci','tm'] },
  { t: 'r/spinalcordinjuries', u: 'https://www.reddit.com/r/spinalcordinjuries/', x: 'Reddit community of people with SCI. Peer advice — not medical advice.', d: ['sci','tm'] },
  { t: 'r/wheelchairs', u: 'https://www.reddit.com/r/wheelchairs/', x: 'Reddit community for wheelchair users of every kind: chairs, cushions, life hacks.', d: MOBILITY }
 ]},
 { cat: 'condition', title: 'Groups for your condition', icon: '🎗️', items: [
  { t: 'National MS Society', u: 'https://www.nationalmssociety.org', ph: '1-800-344-4867', x: 'MS Navigators help with care, benefits, and finding MS specialists.', d: ['ms'] },
  { t: 'ALS Association', u: 'https://www.als.org', x: 'Certified ALS clinics, care services, equipment loan programs.', d: ['als'] },
  { t: 'I AM ALS', u: 'https://iamals.org', x: 'Patient-led community and navigation help for people with ALS.', d: ['als'] },
  { t: 'Amputee Coalition', u: 'https://www.amputee-coalition.org', ph: '1-888-267-5669', x: 'Certified peer visitors, support groups, and limb-loss education.', d: ['amp'] },
  { t: 'American Stroke Association', u: 'https://www.stroke.org', x: 'Stroke recovery guides, support groups, family help.', d: ['stroke'] },
  { t: 'Brain Injury Association of America', u: 'https://www.biausa.org', ph: '1-800-444-6443', x: 'Brain injury help line, state affiliates, and recovery resources.', d: ['tbi'] },
  { t: 'Spina Bifida Association', u: 'https://www.spinabifidaassociation.org', x: 'Care guidelines for all ages, clinics and local chapters.', d: ['sb'] },
  { t: 'Muscular Dystrophy Association (MDA)', u: 'https://www.mda.org', x: 'Care centers and support for muscular dystrophy, ALS and neuromuscular diseases.', d: ['nm','als'] },
  { t: 'Cerebral Palsy Foundation', u: 'https://www.yourcpf.org', x: 'Information and programs for people with cerebral palsy.', d: ['cp'] },
  { t: "Parkinson's Foundation", u: 'https://www.parkinson.org', ph: '1-800-473-4636', x: 'Helpline, expert care centers and education.', d: ['pd'] },
  { t: 'SRNA (transverse myelitis & rare neuro)', u: 'https://wearesrna.org', x: 'Support for transverse myelitis, NMOSD, AFM, ADEM and MOGAD.', d: ['tm'] },
  { t: 'GBS|CIDP Foundation', u: 'https://www.gbs-cidp.org', x: 'Support and education for Guillain-Barré syndrome and CIDP.', d: ['tm','nm'] },
  { t: 'Arthritis Foundation', u: 'https://www.arthritis.org', x: 'Help line, tools, and local support for arthritis.', d: ['joint'] },
  { t: 'U.S. Pain Foundation', u: 'https://uspainfoundation.org', x: 'Support groups and programs for people living with chronic pain.', d: ['pain','sci'] },
  { t: 'National Federation of the Blind', u: 'https://nfb.org', x: 'Training, mentoring, and advocacy by blind people.', d: ['vision'] },
  { t: 'American Foundation for the Blind', u: 'https://www.afb.org', x: 'Guides for living with vision loss, jobs, and technology.', d: ['vision'] },
  { t: 'Hearing Loss Association of America', u: 'https://www.hearingloss.org', x: 'Support chapters and help for people with hearing loss.', d: ['hearing'] },
  { t: 'National Association of the Deaf', u: 'https://www.nad.org', x: 'Civil rights and resources for deaf and hard of hearing people.', d: ['hearing'] },
  { t: 'NINDS condition information', u: 'https://www.ninds.nih.gov', x: 'Plain-language information on hundreds of neurological conditions from the National Institutes of Health.', d: NEURO.concat(['unsure']) }
 ]},
 { cat: 'national', title: 'National government', icon: '🇺🇸', items: [
  { t: 'Social Security disability (SSDI & SSI)', u: 'https://www.ssa.gov/disability', ph: '1-800-772-1213', x: 'Apply early — decisions often take months. SSDI is based on your work history; SSI is based on need.' },
  { t: 'USA.gov benefit finder', u: 'https://www.usa.gov/benefits', x: 'Answer questions to find federal benefits you may qualify for.' },
  { t: 'ADA.gov', u: 'https://www.ada.gov', ph: '1-800-514-0301', x: 'Your rights under the Americans with Disabilities Act, and how to file a complaint.' },
  { t: 'ADA National Network', u: 'https://adata.org', ph: '1-800-949-4232', x: 'Free regional centers that answer ADA questions about work, buildings and services.' },
  { t: 'Job Accommodation Network (JAN)', u: 'https://askjan.org', x: 'Free expert help with workplace accommodations and returning to work.' },
  { t: 'Ticket to Work', u: 'https://choosework.ssa.gov', x: 'Free job help for people on SSDI or SSI who want to work, without losing benefits suddenly.' },
  { t: 'ABLE accounts', u: 'https://www.ablenrc.org', x: 'Tax-advantaged savings accounts that usually don\'t count against SSI or Medicaid limits (disability must begin before the age limit).' },
  { t: 'FMLA — job-protected leave', u: 'https://www.dol.gov/agencies/whd/fmla', x: 'Up to 12 weeks of unpaid, job-protected leave for you or a family caregiver, if eligible.' },
  { t: 'EEOC — disability discrimination at work', u: 'https://www.eeoc.gov/disability-discrimination', x: 'What employers must do, and how to file a charge.' },
  { t: 'U.S. Access Board', u: 'https://www.access-board.gov', x: 'Federal accessibility design guidelines.' },
  { t: 'Administration for Community Living (ACL)', u: 'https://acl.gov', x: 'Federal agency for disability and independent living programs.' },
  { t: 'National Council on Disability', u: 'https://ncd.gov', x: 'Independent federal agency advising on disability policy.' }
 ]},
 { cat: 'state', title: 'State programs', icon: '🏛️', items: [
  { t: 'Your state Vocational Rehabilitation agency', u: 'https://rsa.ed.gov/about/states', x: 'Free help returning to work or school: training, equipment, sometimes vehicle or home changes.' },
  { t: 'Your state Protection & Advocacy agency', u: 'https://www.ndrn.org/about/ndrn-member-agencies/', x: 'Free legal advocacy for disability rights in every state.' },
  { t: 'Centers for Independent Living (CILs)', u: 'https://www.ilru.org/projects/cil-net/cil-center-and-association-directory', x: 'Run by people with disabilities: peer support, skills training, help moving from facility to home.' },
  { t: 'State Assistive Technology programs (AT3 Center)', u: 'https://www.at3center.net', x: 'Every state has one: try or borrow equipment before buying, and reused equipment.' },
  { t: 'State Medicaid home & community services (HCBS)', u: 'https://www.medicaid.gov/medicaid/home-community-based-services/index.html', x: 'Medicaid waivers that pay for in-home care so you can live at home instead of a facility.' },
  { t: 'SHIP — free Medicare counseling', u: 'https://www.shiphelp.org', x: 'Unbiased, free one-on-one Medicare help in every state.' },
  { t: 'Long-term care ombudsman', u: 'https://theconsumervoice.org/get_help', x: 'Free advocate if you live in a nursing home or rehab facility and have a problem with care.', s: ['subacute','nursing'] }
 ]},
 { cat: 'local', title: 'County, city & town help', icon: '📍', local: true, items: [
  { t: '211 — local help line', u: 'https://www.211.org', ph: '211', x: 'Call or text 211 for local food, housing, utility, and transportation help.' },
  { t: 'Eldercare Locator / Aging & Disability Resource Center', u: 'https://eldercare.acl.gov', ph: '1-800-677-1116', x: 'Many local centers serve adults with disabilities of any age, not just seniors.' },
  { q: 'paratransit', t: 'Paratransit (accessible ride service)', x: 'Door-to-door rides for people who can\'t use regular buses. Apply early — approval takes time.' },
  { q: 'disability parking placard', t: 'Disability parking placard', x: 'Apply through your state motor vehicles office; your doctor signs the form.' },
  { q: 'county department of social services Medicaid office', t: 'County social services / Medicaid office', x: 'Where you apply for Medicaid, food benefits and local assistance.' },
  { q: 'accessible housing authority', t: 'Housing authority & accessible housing', x: 'Public housing and vouchers, including wheelchair-accessible units.' },
  { q: 'city ADA coordinator', t: 'City or county ADA coordinator', x: 'The local official who handles accessibility complaints and requests.' },
  { q: 'center for independent living', t: 'Nearest Center for Independent Living', x: 'Peer support and independent-living skills from people with disabilities.' },
  { q: 'adaptive sports', t: 'Local adaptive sports', x: 'Wheelchair basketball, handcycling, swimming, skiing and more.', d: MOBILITY }
 ]},
 { cat: 'medicare', title: 'Medicare', icon: '🩺', items: [
  { t: 'Medicare.gov', u: 'https://www.medicare.gov', ph: '1-800-633-4227', x: 'If you get SSDI, Medicare usually starts after 24 months of SSDI (right away for ALS; special rules for kidney failure).' },
  { t: 'Wheelchairs & scooters coverage', u: 'https://www.medicare.gov/coverage/wheelchairs-scooters', x: 'What Medicare requires before it pays for a manual or power wheelchair.', d: MOBILITY },
  { t: 'Medical equipment suppliers', u: 'https://www.medicare.gov/medical-equipment-suppliers', x: 'Find and compare Medicare-approved equipment suppliers.' },
  { t: 'Care Compare', u: 'https://www.medicare.gov/care-compare/', x: 'Quality ratings for rehab hospitals, nursing homes, home health and doctors.' },
  { t: 'Plan Finder (drug plans)', u: 'https://www.medicare.gov/plan-compare', x: 'Compare drug and Medicare Advantage plans using your own medicine list.' },
  { t: 'Claims, appeals & complaints', u: 'https://www.medicare.gov/claims-appeals', x: 'How to appeal a denial — including fast appeals if you are discharged too soon.' }
 ]},
 { cat: 'medicaid', title: 'Medicaid & health insurance', icon: '🧾', items: [
  { t: 'Medicaid.gov', u: 'https://www.medicaid.gov', x: 'Income often drops after a new disability. Check Medicaid — it can cover care Medicare and private plans don\'t.' },
  { t: 'Home & community-based services waivers', u: 'https://www.medicaid.gov/medicaid/home-community-based-services/index.html', x: 'Pays for personal care attendants and support at home.' },
  { t: 'HealthCare.gov', u: 'https://www.healthcare.gov', x: 'Losing job-based insurance gives you a special enrollment period for a marketplace plan.' },
  { t: 'COBRA (keeping your job\'s insurance)', u: 'https://www.dol.gov/general/topic/health-plans/cobra', x: 'Rules for continuing employer coverage. Disability can extend COBRA to 29 months.' },
  { t: 'InsureKidsNow (Medicaid & CHIP for children)', u: 'https://www.insurekidsnow.gov', x: 'Health coverage for children and teens.', age: 'kid' }
 ]},
 { cat: 'work', title: 'Work & functional recovery', icon: '💼', items: [
  { t: 'Your state Vocational Rehabilitation agency', u: 'https://rsa.ed.gov/about/states', x: 'Free help getting back to work or school: job training, job coaching, and sometimes equipment, vehicle or home changes for work.' },
  { t: 'Free benefits counseling before you work (WIPA)', u: 'https://choosework.ssa.gov/findhelp', x: 'Talk to a free benefits counselor so a paycheck doesn\'t take you by surprise on SSDI, SSI or Medicaid. Also finds employment networks.' },
  { t: 'The Red Book — Social Security work rules', u: 'https://www.ssa.gov/redbook/', x: 'Plain guide to trial work periods and other rules that let you try working without losing benefits right away.' },
  { t: 'Job Accommodation Network (JAN)', u: 'https://askjan.org', x: 'Free expert advice on workplace accommodations for your exact job and disability.' },
  { t: 'Ticket to Work', u: 'https://choosework.ssa.gov', x: 'Free job services for people on SSDI or SSI aged 18–64.' },
  { t: 'Federal jobs for people with disabilities', u: 'https://www.usajobs.gov/help/working-in-government/unique-hiring-paths/individuals-with-disabilities/', x: 'The "Schedule A" hiring path can make it faster to get a federal job.' },
  { t: 'EARN — Employer Assistance & Resource Network', u: 'https://askearn.org', x: 'Information on disability-inclusive employers and your rights at work.' },
  { t: 'Employment after spinal cord injury', u: 'https://msktc.org/sci/factsheets/employment-after-spinal-cord-injury', x: 'Research-based fact sheet on returning to work after SCI.', d: ['sci','tm'] },
  { t: 'Employment after brain injury', u: 'https://msktc.org/tbi/factsheets/employment-after-tbi', x: 'Fact sheet on going back to work after a brain injury.', d: ['tbi','stroke'] },
  { t: 'Understanding SCI: recovery and rehabilitation', u: 'https://msktc.org/sci/factsheets/understanding-spinal-cord-injury-part-2-recovery-and-rehabilitation', x: 'What recovery can look like, and how rehab builds function over time.', d: ['sci','tm'] },
  { t: 'Functional electrical stimulation (FES)', u: 'https://msktc.org/sci/factsheets/functional-electrical-stimulation-fes-sci', x: 'How electrical stimulation can help muscles work for exercise and daily tasks.', d: ['sci','tm','ms','stroke'] },
  { t: 'Walking after spinal cord injury', u: 'https://msktc.org/sci/factsheets/spinal-cord-injury-and-gait-training', x: 'Gait training: who may benefit and what to expect.', d: ['sci','tm'] },
  { t: 'Robotic exoskeletons for walking', u: 'https://msktc.org/sci/factsheets/exoskeleton-and-spinal-cord-injury', x: 'What exoskeletons can and can\'t do, and who can use them.', d: ['sci','tm'] },
  { t: 'Driving after spinal cord injury', u: 'https://msktc.org/sci/factsheets/driving-after-spinal-cord-injury', x: 'Getting back on the road with adapted controls.', d: ['sci','tm'] }
 ]},
 { cat: 'activity', title: 'Physical activity & exercise', icon: '🏋️', items: [
  { t: 'Exercise guidelines for adults with SCI', u: 'https://sciactioncanada.ca', x: 'Science-based guidelines: how much and what kind of exercise helps fitness and heart health after spinal cord injury.', d: ['sci','tm'] },
  { t: 'Exercise after spinal cord injury', u: 'https://msktc.org/sci/factsheets/exercise-after-spinal-cord-injury', x: 'Fact sheet on safe, effective exercise after SCI.', d: ['sci','tm'] },
  { t: 'NCHPAD — adapted exercise', u: 'https://www.nchpad.org', x: 'Free adapted workout videos and programs you can do seated, at home or at the gym.' },
  { t: 'Physical Activity Guidelines for Americans', u: 'https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines', x: 'The national activity guidelines. Ask your doctor or therapist how to adapt them for you.' },
  { t: 'Adaptive sports & recreation', u: 'https://msktc.org/sci/factsheets/adaptive-sports-and-recreation', x: 'Fact sheet on getting started with adaptive sports.', d: MOBILITY },
  { t: 'Move United', u: 'https://moveunitedsport.org', x: 'Find adaptive sports programs near you.' },
  { t: 'Challenged Athletes Foundation', u: 'https://www.challengedathletes.org', x: 'Grants for adaptive sports equipment and coaching.' },
  { q: 'adaptive fitness gym', t: 'Accessible gyms & adaptive fitness near you', x: 'Look for staff trained in adaptive exercise and wheelchair-accessible equipment.', d: MOBILITY }
 ]},
 { cat: 'weight', title: 'Weight & nutrition', icon: '🥗', items: [
  { t: 'Nutrition and spinal cord injury', u: 'https://msktc.org/sci/factsheets/nutrition-and-spinal-cord-injury', x: 'Calorie needs often drop after SCI. How to eat for healthy weight, skin, bowel and bladder.', d: ['sci','tm'] },
  { t: 'Find a registered dietitian', u: 'https://www.eatright.org/find-a-nutrition-expert', x: 'A dietitian can build a weight plan that fits your body, activity level, and medicines. Many are covered by insurance.' },
  { t: 'NCHPAD — healthy living programs', u: 'https://www.nchpad.org', x: 'Free nutrition and weight programs designed for people with disabilities.' },
  { t: 'MyPlate', u: 'https://www.myplate.gov', x: 'Simple, free tools for planning balanced meals.' },
  { t: 'Bone loss after spinal cord injury', u: 'https://msktc.org/sci/factsheets/bone-loss-after-spinal-cord-injury', x: 'Why bones thin after SCI, and how nutrition and activity help.', d: ['sci','tm'] }
 ]},
 { cat: 'sexual', title: 'Sexual health & relationships', icon: '❤️', items: [
  { t: 'Sexuality & sexual functioning after SCI', u: 'https://msktc.org/sci/factsheets/sexuality-sexual-functioning-after-sci', x: 'Frank, research-based answers on sex, sensation, erections, and fertility after spinal cord injury.', d: ['sci','tm','sb','ms'] },
  { t: 'Pregnancy and women with spinal cord injury', u: 'https://msktc.org/sci/factsheets/pregnancy-and-women-spinal-cord-injury', x: 'Planning a pregnancy and having a baby after SCI.', d: ['sci','tm','sb'] },
  { t: 'Sexuality after brain injury', u: 'https://msktc.org/tbi/factsheets/sexuality-after-traumatic-brain-injury', x: 'How brain injury can affect intimacy and what helps.', d: ['tbi','stroke'] },
  { t: 'AASECT — find a certified sex therapist', u: 'https://www.aasect.org/referral-directory', x: 'Search for certified sex therapists and counselors. Many have disability experience — ask.' },
  { t: 'AAMFT — couples therapists', u: 'https://www.aamft.org', x: 'A new disability changes a relationship. Couples therapy can help you both adjust.' },
  { t: 'National MS Society', u: 'https://www.nationalmssociety.org', x: 'Information on intimacy and sexual changes with MS.', d: ['ms'] }
 ]},
 { cat: 'nervepain', title: 'Chronic & nerve pain', icon: '⚡', items: [
  { t: 'Pain after spinal cord injury', u: 'https://msktc.org/sci/factsheets/pain-after-spinal-cord-injury', x: 'Types of pain after SCI — including burning or electric nerve pain — and treatments that can help.', d: ['sci','tm'] },
  { t: 'Shoulder & joint pain: activity changes', u: 'https://msktc.org/sci/factsheets/pain-after-spinal-cord-injury-activity-modification-musculoskeletal-pain', x: 'Protect your shoulders and joints from overuse pain from pushing and transfers.', d: MOBILITY },
  { t: 'Chronic pain after brain injury', u: 'https://msktc.org/tbi/factsheets/traumatic-brain-injury-and-chronic-pain', x: 'Fact sheet on chronic pain after TBI.', d: ['tbi'] },
  { t: 'Headaches after brain injury', u: 'https://msktc.org/tbi/factsheets/headaches-after-traumatic-brain-injury', x: 'Types of headaches after TBI and how they\'re treated.', d: ['tbi'] },
  { t: 'Spasticity and spinal cord injury', u: 'https://msktc.org/sci/factsheets/spasticity-and-spinal-cord-injury', x: 'Muscle spasms can cause pain. Learn the treatment options.', d: ['sci','tm','ms','cp'] },
  { t: 'Opioids and your health', u: 'https://msktc.org/sci/factsheets/opioids-and-your-health', x: 'Safe use of opioid pain medicine and the risks to watch for.' },
  { t: 'Peripheral neuropathy (NIH)', u: 'https://www.ninds.nih.gov/health-information/disorders/peripheral-neuropathy', x: 'Plain-language information on nerve damage and nerve pain.' },
  { t: 'U.S. Pain Foundation', u: 'https://uspainfoundation.org', x: 'Support groups and programs for people living with chronic pain.' }
 ]},
 { cat: 'uti', title: 'Bladder health & preventing UTIs', icon: '💧', items: [
  { t: 'Urinary tract infection and spinal cord injury', u: 'https://msktc.org/sci/factsheets/urinary-tract-infection-and-spinal-cord-injury', x: 'UTI warning signs can look different after SCI. Learn the signs, prevention, and when to call the doctor.', d: ['sci','tm','sb','ms','other','unsure'] },
  { t: 'Bladder management options after SCI', u: 'https://msktc.org/sci/factsheets/bladder-management-options-following-sci', x: 'Catheters and other methods — pros, cons, and infection risk of each.', d: ['sci','tm','sb','ms'] },
  { t: 'Surgical options for bladder management', u: 'https://msktc.org/sci/factsheets/surgical-alternatives-bladder-management-following-sci', x: 'When surgery may make bladder care easier.', d: ['sci','tm','sb'] },
  { t: 'Bladder infection (UTI) in adults — NIH', u: 'https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-infection-uti-in-adults', x: 'Symptoms, causes, treatment and prevention of UTIs.' },
  { t: 'Bowel function after SCI', u: 'https://msktc.org/sci/factsheets/bowel-function-after-spinal-cord-injury', x: 'A good bowel routine also helps protect against bladder infections.', d: ['sci','tm','sb'] }
 ]},
 { cat: 'legal', title: 'Legal help', icon: '⚖️', items: [
  { t: 'NOSSCR — Social Security disability lawyers', u: 'https://www.nosscr.org', x: 'Find lawyers who handle SSDI/SSI claims. Fees are capped by law and usually paid only if you win.' },
  { t: 'LawHelp.org — free legal aid', u: 'https://www.lawhelp.org', x: 'Free and low-cost legal help by state.' },
  { t: 'Legal Services Corporation', u: 'https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help', x: 'Find your local free civil legal aid office.' },
  { t: 'Protection & Advocacy (disability rights lawyers)', u: 'https://www.ndrn.org/about/ndrn-member-agencies/', x: 'Free help with discrimination, access, abuse and denied services.' },
  { t: 'NAELA — special needs & elder law attorneys', u: 'https://www.naela.org', x: 'Lawyers for special needs trusts, guardianship, Medicaid planning.' },
  { t: 'Special Needs Alliance', u: 'https://www.specialneedsalliance.org', x: 'Attorneys focused on disability planning and trusts.' },
  { q: 'state bar lawyer referral service personal injury', t: 'Injury lawyer (your state bar referral)', x: 'If someone else caused your injury, talk to a lawyer soon — there are strict time limits to file.' }
 ]},
 { cat: 'mental', title: 'Mental health & counseling', icon: '💬', items: [
  { t: '988 Suicide & Crisis Lifeline', u: 'https://988lifeline.org', ph: '988', x: 'Call or text 988, any time, for yourself or someone you love.' },
  { t: 'APA Psychologist Locator', u: 'https://locator.apa.org', x: 'Find licensed psychologists. Ask for a "rehabilitation psychologist" if possible.' },
  { t: 'Psychology Today therapist finder', u: 'https://www.psychologytoday.com/us/therapists', x: 'Filter by insurance, specialty (chronic illness, disability), and telehealth.' },
  { t: 'AAMFT — family & couples therapists', u: 'https://www.aamft.org', x: 'Find a marriage and family therapist. A new disability changes the whole family.' },
  { t: 'NAMI HelpLine', u: 'https://www.nami.org/help', ph: '1-800-950-6264', x: 'Free mental health information and referrals.' },
  { t: 'Open Path Collective', u: 'https://openpathcollective.org', x: 'Lower-cost therapy sessions if money is tight.' }
 ]},
 { cat: 'caregiver', title: 'Family & caregivers', icon: '👪', items: [
  { t: 'Family Caregiver Alliance', u: 'https://www.caregiver.org', x: 'Guides and support for family caregivers.' },
  { t: 'ARCH Respite locator', u: 'https://archrespite.org', x: 'Find short-term breaks (respite care) for family caregivers.' },
  { t: 'Caregiver Action Network', u: 'https://www.caregiveraction.org', x: 'Help line and tools for family caregivers.' },
  { t: 'Well Spouse Association', u: 'https://wellspouse.org', x: 'Peer support for spouses and partners who are caregivers.' },
  { t: 'CaringBridge', u: 'https://www.caringbridge.org', x: 'A free page to update friends and family in one place and organize help.' }
 ]},
 { cat: 'home', title: 'Home accessibility', icon: '🚪', items: [
  { t: 'ADA Standards for Accessible Design', u: 'https://www.ada.gov/law-and-regs/design-standards/', x: 'The official measurements for ramps, doors, bathrooms and turning space. A good guide for home changes too.' },
  { t: 'RESNA — Assistive Technology Professionals', u: 'https://www.resna.org/Certification/Certification-Directory', x: 'Find certified ATPs for wheelchair seating and home access technology.' },
  { t: 'NAHB — Certified Aging-in-Place Specialists (CAPS)', u: 'https://www.nahb.org', x: 'Builders and remodelers trained in accessible home changes. Search "CAPS directory".' },
  { t: 'American Institute of Architects', u: 'https://www.aia.org', x: 'Find an architect for larger accessible remodels.' },
  { t: 'Rebuilding Together', u: 'https://rebuildingtogether.org', x: 'Free home repairs and accessibility changes for qualifying homeowners.' },
  { t: 'USDA home repair loans & grants (rural)', u: 'https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-repair-loans-grants', x: 'Low-cost loans and grants for rural homeowners to remove hazards and make homes accessible.' },
  { t: 'VA adapted housing grants', u: 'https://www.va.gov/housing-assistance/disability-housing-grants/', x: 'Grants for veterans to build or change a home for disability.', vet: true }
 ]},
 { cat: 'equipment', title: 'Wheelchairs & equipment', icon: '🦽', items: [
  { t: 'NRRTS — Registered rehab technology suppliers', u: 'https://www.nrrts.org', x: 'Find suppliers credentialed in complex rehab wheelchairs and seating.', d: MOBILITY },
  { t: 'RESNA ATP directory', u: 'https://www.resna.org/Certification/Certification-Directory', x: 'Medicare requires an ATP for many power wheelchairs. Find one here.', d: MOBILITY },
  { t: 'Medicare equipment supplier finder', u: 'https://www.medicare.gov/medical-equipment-suppliers', x: 'Suppliers that accept Medicare in your area.' },
  { t: 'AT3 Center — borrow & reuse equipment', u: 'https://www.at3center.net', x: 'State programs that lend, demonstrate, and give away reused equipment.' },
  { t: 'ALS Association equipment loans', u: 'https://www.als.org', x: 'Many chapters loan wheelchairs and communication devices.', d: ['als'] },
  { t: 'Amputee Coalition — prosthetic info', u: 'https://www.amputee-coalition.org', x: 'Learn about prosthetic options and your insurance rights.', d: ['amp'] }
 ]},
 { cat: 'clothing', title: 'Adaptive clothing & shoes', icon: '👕', items: [
  { t: 'Tommy Hilfiger Adaptive', u: 'https://usa.tommy.com/en/tommy-adaptive', x: 'Magnetic closures, seated-fit pants, easy-open styles.' },
  { t: 'Zappos Adaptive', u: 'https://www.zappos.com/e/adaptive', x: 'Many brands of adaptive clothing and easy-on shoes in one place.' },
  { t: 'IZ Adaptive', u: 'https://izadaptive.com', x: 'Clothing designed for people who sit — wheelchair-cut pants and jackets.', d: MOBILITY },
  { t: 'Silverts', u: 'https://www.silverts.com', x: 'Easy-dressing clothing, including for caregivers helping you dress.' },
  { t: 'ABL Denim', u: 'https://abldenim.com', x: 'Adaptive jeans with features for seated wear and easy dressing.' },
  { t: 'Billy Footwear', u: 'https://billyfootwear.com', x: 'Shoes that zip open all the way around for easy on and off.' },
  { t: 'Nike FlyEase', u: 'https://www.nike.com/flyease', x: 'Hands-free and easy-entry athletic shoes.' }
 ]},
 { cat: 'transport', title: 'Driving & getting around', icon: '🚐', items: [
  { t: 'ADED — driver rehabilitation specialists', u: 'https://www.aded.net', x: 'A certified driver rehab specialist tests and trains you on hand controls and adapted vehicles.' },
  { t: 'NMEDA — mobility equipment dealers', u: 'https://nmeda.org', x: 'Find accredited dealers for wheelchair vans, ramps and hand controls.', d: MOBILITY },
  { t: 'TSA Cares (airport help)', u: 'https://www.tsa.gov/travel/passenger-support', ph: '1-855-787-2227', x: 'Call ahead for help through airport security.' },
  { t: 'Amtrak accessible travel', u: 'https://www.amtrak.com/accessible-travel-services', x: 'Accessible seating, discounts and boarding help on trains.' },
  { t: 'Wheelchair Travel', u: 'https://wheelchairtravel.org', x: 'Detailed accessible travel guides written by a wheelchair user.', d: MOBILITY },
  { t: 'National Parks Access Pass', u: 'https://www.nps.gov/planyourvisit/passes.htm', x: 'Free lifetime pass to national parks for people with permanent disabilities.' }
 ]},
 { cat: 'meds', title: 'Medicine help', icon: '💊', items: [
  { t: 'MedlinePlus drug information', u: 'https://medlineplus.gov/druginformation.html', x: 'Plain-language guides to medicines from the National Library of Medicine.' },
  { t: 'DailyMed', u: 'https://dailymed.nlm.nih.gov', x: 'The official drug labels and patient leaflets.' },
  { t: 'NeedyMeds', u: 'https://www.needymeds.org', x: 'Free programs and coupons to lower medicine costs.' },
  { t: 'Medicine Assistance Tool', u: 'https://medicineassistancetool.org', x: 'Find drug-company assistance programs for your medicines.' },
  { t: 'Medicare Plan Finder', u: 'https://www.medicare.gov/plan-compare', x: 'Compare drug plan costs with your own medicine list.' }
 ]},
 { cat: 'substance', title: 'Alcohol & drug dependency help', icon: '🤝', items: [
  { t: 'SAMHSA National Helpline', u: 'https://www.samhsa.gov/find-help/helplines/national-helpline', ph: '1-800-662-4357', x: 'Free, confidential, 24/7 treatment referral in English and Spanish.' },
  { t: 'FindTreatment.gov', u: 'https://findtreatment.gov', x: 'Official federal locator for treatment programs near you.' },
  { t: 'SMART Recovery', u: 'https://smartrecovery.org', x: 'Science-based mutual support meetings, including online.' },
  { t: 'Alcoholics Anonymous', u: 'https://www.aa.org', x: 'Meetings in person and online.' },
  { t: 'Narcotics Anonymous', u: 'https://na.org', x: 'Meetings in person and online.' }
 ]},
 { cat: 'sports', title: 'Sports, fitness & fun', icon: '🏀', items: [
  { t: 'Move United', u: 'https://moveunitedsport.org', x: 'Adaptive sports programs nationwide.' },
  { t: 'Challenged Athletes Foundation', u: 'https://www.challengedathletes.org', x: 'Grants for adaptive sports equipment and coaching.' },
  { t: 'NCHPAD', u: 'https://www.nchpad.org', x: 'Free adapted exercise videos and fitness programs.' },
  { t: 'Life Rolls On', u: 'https://liferollson.org', x: 'Adaptive surfing and skating events.', d: MOBILITY }
 ]},
 { cat: 'veterans', title: 'Veterans', icon: '🎖️', vetOnly: true, items: [
  { t: 'VA Spinal Cord Injuries & Disorders', u: 'https://www.sci.va.gov', x: 'VA SCI/D centers offer lifelong specialized care for veterans.', d: ['sci','ms','als','tm','unsure','other'] },
  { t: 'VA.gov', u: 'https://www.va.gov', x: 'Health care, disability compensation, and benefits.' },
  { t: 'Paralyzed Veterans of America', u: 'https://pva.org', x: 'Free benefits help from national service officers.' },
  { t: 'Disabled American Veterans (DAV)', u: 'https://www.dav.org', x: 'Free help filing VA claims.' },
  { t: 'VA adapted housing grants', u: 'https://www.va.gov/housing-assistance/disability-housing-grants/', x: 'Grants to adapt a home.' }
 ]},
 { cat: 'kids', title: 'Children & teens', icon: '🧒', ageOnly: 'kid', items: [
  { t: "Shriners Children's", u: 'https://www.shrinerschildrens.org', x: 'Pediatric spinal cord injury, orthopedic and rehab care, regardless of ability to pay.' },
  { t: 'Parent Center Hub', u: 'https://www.parentcenterhub.org', x: 'Find your state parent center for IEP and school help.' },
  { t: 'Family Voices', u: 'https://familyvoices.org', x: 'Family-to-family help for children with special health care needs.' },
  { t: 'Understood (IEP & 504 plans)', u: 'https://www.understood.org', x: 'Plain guides for school accommodations.' },
  { t: 'InsureKidsNow', u: 'https://www.insurekidsnow.gov', x: 'Medicaid and CHIP for children.' }
 ]},
 { cat: 'seniors', title: 'Age 65 and over', icon: '🧓', ageOnly: 'senior', items: [
  { t: 'Medicare.gov', u: 'https://www.medicare.gov', ph: '1-800-633-4227', x: 'At 65, Medicare is usually your main insurance.' },
  { t: 'SHIP — free Medicare counseling', u: 'https://www.shiphelp.org', x: 'Free help choosing plans and appealing denials.' },
  { t: 'Eldercare Locator', u: 'https://eldercare.acl.gov', ph: '1-800-677-1116', x: 'Find your Area Agency on Aging for in-home help, meals, rides.' }
 ]}
];

/* ---------- Plan steps ---------- */
/* p: now | soon | later */
const STEPS = [
  // Everyone
  { id: 'folder', p: 'now', t: 'Start one folder for everything', x: 'Paper or a phone album. Keep discharge papers, bills, insurance letters, and denials in one place.' },
  { id: 'point', p: 'now', t: 'Choose a "point person"', x: 'One trusted person who can help make calls, track paperwork, and speak for you if needed.' },
  { id: 'dx', p: 'now', t: 'Get your diagnosis in writing', x: 'Ask for your exact diagnosis (and injury level, if SCI), test results, and every discharge summary.' },
  { id: 'insur', p: 'now', t: 'Call your insurance and ask for a case manager', x: 'Ask what rehab, equipment, and home care are covered, and get names and reference numbers for every call.' },
  { id: 'work', p: 'now', t: 'Tell your employer and ask about leave and disability pay', x: 'Ask HR about FMLA, short-term and long-term disability insurance, and keeping your health insurance.' },
  { id: 'lawyer', p: 'now', t: 'If someone else caused your injury, talk to a lawyer', x: 'There are strict deadlines. Many injury lawyers offer a free first meeting.', acc: true },
  { id: 'skin', p: 'now', t: 'Learn pressure-injury (bed sore) prevention', x: 'Ask your team how often to shift weight and how to check your skin every day.', d: ['sci','ms','als','tm','sb','nm','cp','stroke','other','unsure'] },
  { id: 'bladder', p: 'now', t: 'Learn your bladder and bowel program', x: 'Ask for a written routine and the supplies you need, and train a family member too.', d: ['sci','ms','sb','tm'] },
  { id: 'ad', p: 'now', t: 'Learn the signs of autonomic dysreflexia', x: 'If your SCI is at T6 or above: a pounding headache, flushing, or sweating above the injury can be an emergency. Carry a wallet card.', d: ['sci'] },
  { id: 'ssdi', p: 'soon', t: 'Apply for Social Security disability (SSDI/SSI)', x: 'If you expect to be unable to work for 12 months or more, apply early. Decisions often take months.' },
  { id: 'medicaid', p: 'soon', t: 'Check if you qualify for Medicaid', x: 'Your income may have dropped. Medicaid can pay for care at home that other insurance won\'t.' },
  { id: 'peer', p: 'soon', t: 'Talk with a peer mentor', x: 'Someone who has lived with the same disability. The Reeve Foundation, United Spinal, and condition groups can connect you.' },
  { id: 'counsel', p: 'soon', t: 'Talk to a counselor — for you and your family', x: 'Grief, fear, and anger are normal. A rehabilitation psychologist or family therapist can help.' },
  { id: 'seating', p: 'soon', t: 'Get a wheelchair seating evaluation', x: 'A PT or OT plus a certified ATP should fit your chair and cushion. A basic loaner is not meant for long-term use.', d: MOBILITY },
  { id: 'placard', p: 'soon', t: 'Apply for a disability parking placard', x: 'Your doctor signs the form; you file with your state motor vehicles office.' },
  { id: 'proxy', p: 'soon', t: 'Name a health care proxy and make an advance directive', x: 'Decide who can make medical choices if you can\'t, and write down your wishes.' },
  { id: 'emerg', p: 'soon', t: 'Make an emergency information card', x: 'Your diagnosis, medicines, allergies, doctors, and emergency contacts — on paper and on your phone.' },
  { id: 'paratransit', p: 'soon', t: 'Apply for paratransit', x: 'Approval can take weeks, so start before you need it.', s: ['acute','subacute','nursing','home','family'] },
  { id: 'uti', p: 'now', t: 'Learn the warning signs of a urinary tract infection', x: 'Ask your team what signs to watch for (they can look different after nerve damage), how much to drink, and how to keep catheter supplies clean.', d: ['sci','ms','sb','tm'] },
  { id: 'nerve', p: 'soon', t: 'Tell your doctor about any burning, tingling or electric pain', x: 'Nerve pain is common and treatable. Ask about medicines, therapy, and non-drug options — and keep a simple pain log.', d: ['sci','ms','tm','stroke','amp','tbi','pain','nm','other','unsure'] },
  { id: 'move', p: 'soon', t: 'Get an exercise plan you can do safely', x: 'Ask your PT or OT for a home routine that builds strength and protects your shoulders and heart.' },
  { id: 'function', p: 'soon', t: 'Ask about ongoing therapy to keep gaining function', x: 'Outpatient PT/OT, functional electrical stimulation, or other programs may help after discharge.', d: MOBILITY },
  { id: 'sex', p: 'soon', t: 'Ask your rehab team about sexual health', x: 'It\'s a normal, important question. Your team can help with function, sensation, positioning, and fertility.' },
  { id: 'diet', p: 'later', t: 'See a registered dietitian about weight and nutrition', x: 'Calorie needs often change when you move less. A dietitian can help you avoid gaining or losing too much.' },
  { id: 'wipa', p: 'later', t: 'Before returning to work, talk to a free benefits counselor', x: 'A WIPA counselor explains how earnings affect SSDI, SSI and Medicaid, so there are no surprises.' },
  { id: 'vr', p: 'later', t: 'Contact your state Vocational Rehabilitation agency', x: 'When you are ready, they can help with job training, school, and equipment for work.' },
  { id: 'drive', p: 'later', t: 'Get a driving evaluation', x: 'A certified driver rehab specialist can test you for hand controls or an adapted vehicle.', d: ['sci','amp','stroke','tbi','ms','tm','sb','cp','other','unsure'] },
  { id: 'able', p: 'later', t: 'Look into an ABLE savings account', x: 'Lets you save money without losing SSI or Medicaid, if you qualify.' },
  { id: 'sports', p: 'later', t: 'Try an adaptive sport or fitness program', x: 'Staying active protects your health and helps you meet people who get it.' },
  { id: 'annual', p: 'later', t: 'Plan a yearly check-up with a rehab doctor', x: 'A physiatrist can catch problems early with skin, bladder, bones, shoulders, and equipment.', d: MOBILITY },

  // Hospital
  { id: 'h-pmr', p: 'now', s: ['hospital'], t: 'Ask for a rehab doctor (PM&R) consult', x: 'A physiatrist can tell you what rehab you need and how soon.' },
  { id: 'h-choose', p: 'now', s: ['hospital'], t: 'You can choose your rehab facility', x: 'Ask the case manager for a list. Ask about SCI Model System or CARF-accredited programs, and how many patients like you they treat each year.' },
  { id: 'h-auth', p: 'now', s: ['hospital'], t: 'Ask the case manager to start insurance approval for acute rehab', x: 'Approval can take days. Ask what to do if insurance says no — you can appeal.' },
  { id: 'h-family', p: 'soon', s: ['hospital'], t: 'Ask family to call or visit the rehab facilities', x: 'Questions: How many hours of therapy a day? Do they train family? Is there a wheelchair seating clinic?' },

  // Acute rehab
  { id: 'a-train', p: 'now', s: ['acute'], t: 'Have family attend therapy and learn your care', x: 'Transfers, skin checks, bladder and bowel care, and equipment use — practice before you go home.' },
  { id: 'a-dme', p: 'now', s: ['acute'], t: 'Order your wheelchair and equipment before discharge', x: 'Custom chairs can take weeks or months. Ask what loaner you will use until it arrives.', d: MOBILITY },
  { id: 'a-homeeval', p: 'now', s: ['acute'], t: 'Ask for a home accessibility evaluation', x: 'An OT can tell you what has to change — entrance, bathroom, bed — before you go home.' },
  { id: 'a-dc', p: 'soon', s: ['acute'], t: 'Get your discharge plan in writing', x: 'Follow-up appointments, outpatient or home therapy, prescriptions, and supply orders.' },

  // Subacute
  { id: 's-acute', p: 'now', s: ['subacute'], t: 'Ask if you could move to acute rehab when stronger', x: 'Acute rehab is more intensive and may help you recover more. Ask your doctor to re-check.' },
  { id: 's-days', p: 'now', s: ['subacute'], t: 'Ask how many days your insurance covers here', x: 'Medicare covers up to 100 days in a skilled facility, with a daily copay after day 20, if you keep meeting the rules.' },
  { id: 's-appeal', p: 'soon', s: ['subacute','nursing'], t: 'Know how to appeal if you are discharged too soon', x: 'You should get a written notice. Medicare offers a fast appeal — call the number on the notice right away.' },

  // Nursing home
  { id: 'n-rights', p: 'now', s: ['nursing'], t: 'Know your resident rights', x: 'You have the right to take part in your care plan. A long-term care ombudsman can help for free.' },
  { id: 'n-home', p: 'soon', s: ['nursing'], t: 'Ask about programs to move back home', x: 'Ask about Medicaid home services, "Money Follows the Person," and your local Center for Independent Living.' },
  { id: 'n-therapy', p: 'soon', s: ['nursing'], t: 'Ask for therapy goals in writing', x: 'Know what you are working toward and when progress will be reviewed.' },

  // Home / relative
  { id: 'o-follow', p: 'now', s: ['home','family'], t: 'Book your follow-up appointments', x: 'Rehab doctor, primary care, and any specialists from your discharge plan.' },
  { id: 'o-therapy', p: 'now', s: ['home','family'], t: 'Start outpatient or home therapy', x: 'Make sure the referral was sent and that insurance has approved it.' },
  { id: 'o-care', p: 'soon', s: ['home','family'], t: 'Find in-home help', x: 'Ask about home health, Medicaid personal care attendants, and self-directed care programs in your state.' },
  { id: 'o-mods', p: 'soon', s: ['home','family'], t: 'Plan home changes', x: 'Ramp, door widths, bathroom, and bed. Your state AT program may lend equipment while you decide.' },
  { id: 'f-plan', p: 'soon', s: ['family'], t: 'Talk with your family about a longer-term living plan', x: 'Where you will live in 6–12 months, and what help they can and can\'t give.' },
  { id: 'f-address', p: 'soon', s: ['family'], t: 'Update your mailing address everywhere', x: 'Insurance, Social Security, doctors, and pharmacy — so you don\'t miss important letters.' },
  { id: 'f-respite', p: 'later', s: ['family','home'], t: 'Find respite care for your caregiver', x: 'Caregivers need breaks to keep going. Respite programs can help.' },

  // Disability-specific
  { id: 'als-clinic', p: 'now', d: ['als'], t: 'Connect with a certified ALS clinic', x: 'Multi-specialty clinics coordinate breathing, nutrition, equipment and speech care.' },
  { id: 'als-ssdi', p: 'now', d: ['als'], t: 'Apply for SSDI now — ALS has special rules', x: 'For ALS there is no 5-month SSDI waiting period, and Medicare starts when SSDI starts.' },
  { id: 'als-voice', p: 'soon', d: ['als'], t: 'Ask about voice banking', x: 'Recording your voice early lets a future speech device sound like you.' },
  { id: 'ms-dmt', p: 'now', d: ['ms'], t: 'See an MS specialist about treatment', x: 'Ask about disease-modifying therapies and the MS Society\'s Navigator program.' },
  { id: 'amp-peer', p: 'soon', d: ['amp'], t: 'Ask for an Amputee Coalition peer visitor', x: 'A trained volunteer with limb loss can visit or call you.' },
  { id: 'amp-pros', p: 'soon', d: ['amp'], t: 'Meet a prosthetist and learn limb care', x: 'Ask about shrinkers, skin care, and the timeline for a first prosthesis.' },
  { id: 'tbi-neuro', p: 'soon', d: ['tbi','stroke'], t: 'Ask about a neuropsychology evaluation', x: 'It shows how memory and thinking were affected and guides therapy and return to work.' },
  { id: 'stroke-speech', p: 'soon', d: ['stroke'], t: 'Ask whether you need speech and swallowing therapy', x: 'Speech therapy helps with talking, understanding, and swallowing safely.' },

  // Age & veterans
  { id: 'kid-iep', p: 'soon', age: 'kid', t: 'Contact the school about an IEP or 504 plan', x: 'Schools must provide accommodations and services. Your state parent center can help.' },
  { id: 'kid-transition', p: 'later', age: 'kid', t: 'Plan for the move to adult care', x: 'Start planning at 14–16 for adult doctors, insurance, and benefits at 18.' },
  { id: 'sr-ship', p: 'soon', age: 'senior', t: 'Talk to a free Medicare counselor (SHIP)', x: 'They help you pick plans and appeal denials.' },
  { id: 'vet-va', p: 'now', vet: true, t: 'Contact the VA about health care and benefits', x: 'Ask about the VA Spinal Cord Injuries & Disorders system and a free Veterans Service Officer.' }
];

/* ---------- Equipment suggestions ---------- */
const EQUIP = [
  { n: 'Wheelchair (manual)', d: MOBILITY },
  { n: 'Power wheelchair', d: ['sci','ms','als','nm','cp','tm','other','unsure'] },
  { n: 'Pressure-relief wheelchair cushion', d: MOBILITY },
  { n: 'Backup / loaner wheelchair', d: MOBILITY },
  { n: 'Transfer board', d: ['sci','amp','stroke','ms','tm','sb','other'] },
  { n: 'Shower chair or tub bench', d: MOBILITY },
  { n: 'Commode chair', d: MOBILITY },
  { n: 'Hospital bed', d: ['sci','als','ms','nm','tm','stroke','other'] },
  { n: 'Pressure-relief mattress', d: ['sci','als','ms','nm','tm','sb','other'] },
  { n: 'Patient lift (Hoyer)', d: ['sci','als','nm','ms','cp'] },
  { n: 'Grab bars', d: MOBILITY },
  { n: 'Ramp', d: MOBILITY },
  { n: 'Reacher / grabber', d: MOBILITY },
  { n: 'Catheter supplies', d: ['sci','ms','sb','tm'] },
  { n: 'Bowel program supplies', d: ['sci','ms','sb','tm'] },
  { n: 'Standing frame', d: ['sci','sb','cp','tm'] },
  { n: 'Wheelchair gloves', d: ['sci','amp','sb','tm','other'] },
  { n: 'Hand controls for driving', d: ['sci','amp','sb','tm','other'] },
  { n: 'Prosthesis', d: ['amp'] },
  { n: 'Walker or cane', d: ['stroke','ms','pd','tbi','joint','amp','other','unsure'] },
  { n: 'Braces / orthotics', d: ['sci','stroke','cp','sb','nm','ms'] },
  { n: 'Communication device', d: ['als','stroke','tbi','cp'] },
  { n: 'Ventilator / breathing equipment', d: ['als','nm','sci'] },
  { n: 'Smart speaker or voice control', d: ['sci','als','ms','nm','vision','cp'] }
];

/* ---------- Questions to ask (by setting) ---------- */
const QUESTIONS = {
  hospital: ['What exactly is my diagnosis, and what does it mean for my future?', 'Which rehab facilities will accept me, and can I choose?', 'When can I start rehab?', 'What will my insurance cover?'],
  acute: ['How many hours of therapy will I get each day?', 'When is my expected discharge date?', 'What equipment will I need at home, and who orders it?', 'Can my family be trained before I leave?'],
  subacute: ['Could I qualify for acute rehab later?', 'How many covered days do I have left?', 'What are my therapy goals?', 'What is the plan for going home?'],
  nursing: ['What is my care plan, and can I attend the meeting?', 'What therapy will I receive?', 'Which programs could help me move home?', 'Who do I talk to if I have a complaint?'],
  home: ['Who do I call if something goes wrong at night?', 'Which warning signs mean I should go to the ER?', 'How do I reorder supplies?', 'When is my next rehab doctor visit?'],
  family: ['Who do I call if something goes wrong at night?', 'What help do my family need to learn?', 'Is there respite care for my caregiver?', 'How do I reorder supplies?']
};

const COMMON_MEDS = ['baclofen','gabapentin','pregabalin','tizanidine','oxybutynin','senna','docusate','enoxaparin','duloxetine','acetaminophen'];
