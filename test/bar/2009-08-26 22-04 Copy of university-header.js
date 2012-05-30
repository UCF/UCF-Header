/**** Insert Bar markup and CSS resources ***/
	function myucf(){
		var myucfvisible = $('#myucfWrapper').is(':visible');
		var customizevisible = $('#customizeWrapper').is(':visible');
		if(customizevisible == true){
			$("#customizeWrapper").slideUp("slow", function(){
				$("#myucfWrapper").slideDown('slow');
			});	
		}
		if(myucfvisible == false && customizevisible == false){
			$("#myucfWrapper").slideDown("slow")
		}
		if(myucfvisible == true && customizevisible == false){
			$("#myucfWrapper").slideUp("slow")
		}
		
	}
	function customize(){
		var myucfvisible = $('#myucfWrapper').is(':visible');
		var customizevisible = $('#customizeWrapper').is(':visible');
		if(myucfvisible == true){
			$("#myucfWrapper").slideUp("slow", function(){
				$("#customizeWrapper").slideDown('slow');
			});	
		}
		if(myucfvisible == false && customizevisible == false){
			$("#customizeWrapper").slideDown("slow")
		}
		if(myucfvisible == false && customizevisible == true){
			$("#customizeWrapper").slideUp("slow")
		}
		
		
	}
	function GlobalUCFHeaderInit(){
		// Insert CSS link as first  item in head of document
		headerCSS = document.createElement("link")
		headerCSS.setAttribute("href","bar.css");
		headerCSS.setAttribute("rel","stylesheet");
		headerCSS.setAttribute("type","text/css");

		headEl = document.getElementsByTagName("head")[0];
		if (headEl.childNodes.length > 0 ) {
			headEl.insertBefore(headerCSS,headEl.firstChild);
		} else {
			headEl.appendChild(headerCSS);
		}
		
		// find and create insertion point for header
		// first item in the body
		headerDiv = document.createElement("div");
		headerDiv.id = "UCFHBHeader";
		bodyEl = document.getElementsByTagName("body")[0];
		
		if (bodyEl.childNodes.length > 0 ) {
			bodyEl.insertBefore(headerDiv,bodyEl.firstChild);
		} else {
			bodyEl.appendChild(headerDiv);
		}
		
		// create contents
		var elementContent=
		'<div id="myucfWrapper">'+
			'<div id="expand">'+
				'<div id="myucf">'+
				'<img src="https://my.ucf.edu/cdws/images/myucf_toplogo.gif" alt"myUCF Logo" />'+
					'<form action="https://my.ucf.edu/psp/PAPROD/EMPLOYEE/EMPL/?cmd=login" method="post" id="login" name="login" autocomplete="off" onsubmit="signin(document.login);">'+
					'<input type="hidden" name="httpPort" value=""/> '+
					'<input type="hidden" name="timezoneOffset" value="0" />'+
					'<p>Username:'+
					'<input type="text" id="userid" name="userid"/>'+
					'</p><br/>'+
					'<p>Password:'+
					'<input type="password" id="pwd" name="pwd" />'+
					'</p><br/>'+
					'<input type="submit" name="Submit" value="Sign On" id="myUCFsubmit" />'+
					'</form>'+
				'</div>'+
				'</div>'+
			'</div>'+
		'</div>'+
		'<div id="customizeWrapper">'+
			'<div id="expand">'+
				'<form>'+
				'<div id="quicklinks-panel">'+
					'<div class="quicklinks-column">'+
						'<h3>Available Links</h3>'+
						'<select multiple="multiple" id="sourceLinks" class="quicklinks-list">'+
						'<option value="http://pegasus.cc.ucf.edu/~aac/public/advisors.html">Academic Advisors</option><option value="http://www.registrar.sdes.ucf.edu/calendar/">Academic Calendar</option><option value="http://www.adr.sdes.ucf.edu/">Academic Development And Retention</option><option value="http://www.aep.sdes.ucf.edu/">Academic Exploration Program (A.E.P.)</option><option value="http://www.ucf.edu/programs/index.html">Academic Programs</option><option value="http://www.academicservices.ucf.edu/">Academic Services</option><option value="http://www.assa.sdes.ucf.edu/">Academic Services For Student Athletes (A.S.S.A.)</option><option value="http://www.bus.ucf.edu/accounting/cgi-bin/site/sitew.cgi">Accounting, Kenneth G. Dixon School of</option><option value="http://www.iroffice.ucf.edu/degrees/index.html">Accreditations and Degrees</option><option value="http://www.osi.sdes.ucf.edu/">Activities for Students</option><option value="http://www.asf.ucf.edu/">Activity and Service Fee Business Office</option><option value="http://campusmap.ucf.edu/address.php">Address, UCF</option><option value="http://pegasus.cc.ucf.edu/~admfin/">Administration &amp; Finance Division</option><option value="http://www.admin.sdes.ucf.edu/">Administrative Services, Assistant Vice President</option><option value="http://www.admissions.ucf.edu/">Admissions Undergraduate</option><option value="http://pegasus.cc.ucf.edu/~ampac/home.html">Advanced Materials Processing And Analysis Center (Ampac)</option><option value="http://www.collegepark.org/ucf/">Affiliated Housing</option><option value="http://www.cas.ucf.edu/africanamericanstudies/">African American Studies</option><option value="http://airforce.ucf.edu/">Air Force R.O.T.C.</option><option value="http://www.aod.sdes.ucf.edu/">Alcohol and Other Drug Prevention Programming</option><option value="http://www.ucfalumni.com/Main/">Alumni Association</option><option value="http://www.ucfdirectory.com/">Alumni Directory</option><option value="http://www.ucfalumni.com/Main/Default.asp?CategoryID=3">Alumni Events</option><option value="http://www.ucf.edu/pls/CDWS/W4_BBS_ANNOUNCEMENTS.main_disp_sel?p_role=all">Announcements, All</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_announcements.main_disp_sel?p_role=faculty">Announcements, Faculty</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_announcements.main_disp_sel?p_role=prospective">Announcements, Prospective Students</option><option value="http://www.ucf.edu/pls/CDWS/W4_BBS_ANNOUNCEMENTS.main_disp_sel?p_role=gpublic">Announcements, Public</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_announcements.main_disp_sel?p_role=staff">Announcements, Staff</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_announcements.main_disp_sel?p_role=student">Announcements, Student</option><option value="http://anthropology.cos.ucf.edu/">Anthropology</option><option value="http://aatc.education.ucf.edu/">Apple Authorized Training Center at UCF</option><option value="http://www.graduate.ucf.edu/sitemap/index.cfm?RsrcID=53">Application Information, Graduate</option><option value="http://www.admissions.sdes.ucf.edu/apply-now.asp">Application Information, Undergraduate</option><option value="https://my.ucf.edu/psp/PAPROD/EMPLOYEE/PAPROD/h/?tab=PAPP_GUEST">Application Status</option><option value="http://caat.engr.ucf.edu/">Applied Acoustoelectronic Technology, Consortium Of</option><option value="http://pegasus.cc.ucf.edu/~cahfa/">Applied Human Factors In Aviation, Center For</option><option value="http://www.arboretum.ucf.edu/">Arboretum</option><option value="http://www.ucfarena.com/">Arena/Global Spectrum, UCF</option><option value="http://www.army.ucf.edu/">Army R.O.T.C.</option><option value="http://www.art.ucf.edu/">Art Department</option><option value="http://education.ucf.edu/arted">Art Education Program</option><option value="http://www.cah.ucf.edu/">Arts &amp; Humanities, College Of</option><option value="http://www.cah.ucf.edu/students/graduate.php">Arts and Humanities, Graduate Student Web Site, College Of</option><option value="http://library.ucf.edu/Ask">Ask A Librarian</option><option value="http://ask.ucf.edu/">Ask UCF</option><option value="http://www.ucfathletics.com/">Athletics</option><option value="http://www.ucfbcm.com/">Baptist Collegiate Ministries</option><option value="http://biology.cos.ucf.edu/">Biology Department</option><option value="http://www.biomed.ucf.edu/">Biomedical Sciences, Burnett School of</option><option value="http://www.biomed.ucf.edu/">Biomolecular Science Center</option><option value="http://www.biomed.ucf.edu/">Biomolecular Sciences, Ph. D</option><option value="http://www.bfsa-ucf.org/">Black Faculty And Staff Association, U.C.F. (B.F.S.A.)</option><option value="http://bot.ucf.edu/">Board Of Trustees, UCF</option><option value="http://www.bookstore.ucf.edu/">Bookstore, University</option><option value="http://budget.ucf.edu/">Budget Office</option><option value="http://honors.ucf.edu/">Burnett Honors College</option><option value="http://golynx.com/index.cfm?fuse=cstm&amp;app=route&amp;view=sched&amp;cid=13">Bus Schedule, Lynx UCF Route</option><option value="http://parking.ucf.edu/Shuttle.html">Bus, UCF Shuttle</option><option value="http://www.bus.ucf.edu/">Business Administration, College Of</option><option value="http://www.bus.ucf.edu/oss/cgi-bin/site/sitew.cgi?page=/index.htx">Business Administration, College Of, Office Of Student Support</option><option value="http://www.businessservices.ucf.edu/">Business Services</option><option value="http://www.ucm.sdes.ucf.edu/">Campus Faiths &amp; Ministries</option><option value="http://www.campuslife.sdes.ucf.edu/">Campus Life</option><option value="http://www.regionalcampuses.ucf.edu/easterncampuslife.htm">Campus Life, Eastern Region</option><option value="http://campusmap.ucf.edu/flash/index.php">Campus Map</option><option value="http://www.admissions.sdes.ucf.edu/about2.asp">Campus Open House</option><option value="http://police.ucf.edu/CrimeStats.html">Campus Security Report</option><option value="http://www.admissions.sdes.ucf.edu/about.asp?FirstSub=infosess">Campus Tours</option><option value="http://www.ucfcard.ucf.edu/">Card Office, UCF</option><option value="http://www.cohpa.ucf.edu/health.pro/cardiobs.cfm">Cardiopulmonary Sciences Program</option><option value="http://www.bus.ucf.edu/crc/cgi-bin/site/sitew.cgi?page=/index.htx">Career Resource Center (Satellite Office), Business Administration, College Of</option><option value="http://www.career.ucf.edu/">Career Services</option><option value="http://www.fa.ucf.edu/Cashier/Cashier.cfm">Cashier, UCF Office of the</option><option value="http://www.ccmknights.com/">Catholic Campus Ministry</option><option value="http://www.clubs.cecs.ucf.edu/ecc/">CECS Deans Student Advisory Council</option><option value="http://ucf-card.org/">Center for Autism and Related Disabilities</option><option value="http://www.centralfloridafuture.com/">Central Florida Future</option><option value="https://my.ucf.edu/">Check Your Graduate Admissions Status</option><option value="http://www.admissions.sdes.ucf.edu/apply-now.asp?FirstSub=checkappstatus">Check Your Undergraduate Admissions Status</option><option value="http://chemistry.cos.ucf.edu/">Chemistry</option><option value="http://education.ucf.edu/cfcs">Child, Family, And Community Sciences</option><option value="http://www.cee.ucf.edu/">Civil &amp; Environmental Engineering</option><option value="https://my.ucf.edu/static_support/classsearchwrapper.html">Class Schedule</option><option value="http://reach.ucf.edu/~edintern/">Clinical Experiences,College Of Education</option><option value="http://www.businessservices.ucf.edu/clipjoint.html">Clip Joint</option><option value="http://www.ucf.edu/academics/">Colleges &amp; Schools</option><option value="http://www.registrar.ucf.edu/commencement/">Commencement</option><option value="http://communication.cos.ucf.edu/">Communication, Nicholson School Of</option><option value="http://www.cohpa.ucf.edu/comdis/">Communicative Disorders</option><option value="http://www.centralfloridapartnershipcenter.org/">Community Partnership, COHPA Center For</option><option value="http://pegasus.cc.ucf.edu/~divcomre/">Community Relations, Division of</option><option value="http://cwrsl.cecs.ucf.edu/index.htm">Compaq Water Resources Simulations Laboratory</option><option value="http://www.computerlabs.ucf.edu/">Computer Labs</option><option value="http://www.cst.ucf.edu/">Computer Services &amp; Telecommunications</option><option value="http://www.cstore.ucf.edu/">Computer Store &amp; PC Support Center</option><option value="http://pegasus.cc.ucf.edu/~csrce/">Consortium For Social Responsibility And Character In Education</option><option value="http://www.ucf.edu/contact/">Contact UCF</option><option value="http://www.cecs.ucf.edu/gps">Continuing Technology In Education</option><option value="http://www.printing.ucf.edu/copy_services.shtml#convenience">Convenience Copiers</option><option value="http://www.coop.ucf.edu/?go=aboutcoop">Cooperative Education</option><option value="http://www.printing.ucf.edu/copy_services.shtml">Copy Center</option><option value="http://www.iroffice.ucf.edu/character/current_tuition.html">Cost Of Attendance</option><option value="http://www.counseling.sdes.ucf.edu/">Counseling Center</option><option value="https://www.secure.sdes.ucf.edu/undergraduate_admissions/counselor_rec.asp">Counselor Recommendation Form, Undergraduate</option><option value="http://cdws.ucf.edu/">Course Development &amp; Web Services</option><option value="http://www.csc.sdes.ucf.edu/">Creative School For Children</option><option value="http://www.ucffedcu.org/">Credit Union, U.C.F. Federal</option><option value="http://www.cohpa.ucf.edu/crim.jus/">Criminal Justice &amp; Legal Studies</option><option value="http://library.ucf.edu/CMC/">Curriculum Materials Center</option><option value="http://pegasus.cc.ucf.edu/~cypress/">Cypress Christian Life</option><option value="http://pegasus.cc.ucf.edu/~cdome/">Cypress Dome</option><option value="http://robotcamp.ucf.edu/">Davinci Robotics Outreach</option><option value="http://www.bus.ucf.edu/dean/cgi-bin/site/sitew.cgi">Deans Office, Business Administration, College Of</option><option value="http://universityrelations.ucf.edu/divisions/dts.html">Defense Transition Services</option><option value="http://pegasus.cc.ucf.edu/~partners/">Development Office, College of Education</option><option value="http://www.dm.ucf.edu/">Digital Media Department</option><option value="http://www.campusdish.com/en-US/CSS/UnivCentralFlorida">Dining Services</option><option value="http://campusmap.ucf.edu/address.php">Directions to Campuses</option><option value="http://www.drs.sdes.ucf.edu/">Dispute Resolution Services</option><option value="http://distrib.ucf.edu/cdl/">Distributed Learning, Center For</option><option value="http://diversity.ucf.edu/">Diversity Initiatives, Office Of</option><option value="http://pegasus.cc.ucf.edu/~divcomre/">Division of Community Relations</option><option value="http://www.dce.ucf.edu/">Division Of Continuing Education</option><option value="http://www.cohpa.ucf.edu/pubaffphd/">Doctoral Program In Public Affairs</option><option value="http://www.bus.ucf.edu/dpi">Dr. Phillips Institute For The Study Of American Business Activity, Business Administration, College Of</option><option value="http://education.ucf.edu/ece">Early Childhood Education Program</option><option value="http://ecommunity.ucf.edu/">eCommunity</option><option value="http://waterinfo.cecs.ucf.edu/">Econlockhatchee River Basin Waterinfo</option><option value="http://www.bus.ucf.edu/economics/cgi-bin/site/sitew.cgi">Economics, Department Of, Business Administration, College Of</option><option value="http://education.ucf.edu/edd">Ed.D. in Education</option><option value="http://education.ucf.edu/eds">Ed.S. in Education</option><option value="http://education.ucf.edu/">Education, College Of</option><option value="http://pegasus.cc.ucf.edu/~edmedia">Educational Media</option><option value="http://education.ucf.edu/ertl">Educational Research, Technology And Leadership</option><option value="http://education.ucf.edu/es">Educational Studies</option><option value="http://pegasus.cc.ucf.edu/~edtech/">Educational Technology</option><option value="http://www.eecs.ucf.edu/">Electrical Engineering and Computer Science, School of</option><option value="http://library.ucf.edu/Databases/">Electronic Resources Library</option><option value="http://www.cecs.ucf.edu/">Engineering &amp; Computer Science, College Of</option><option value="http://www.ent.ucf.edu/">Engineering Technology</option><option value="http://www.english.ucf.edu/">English Department</option><option value="http://www.ehs.ucf.edu/">Environmental Health &amp; Safety</option><option value="http://www.environment.ucf.edu/">Environmental Management, UCF</option><option value="http://www.cas.ucf.edu/Liberal_Studies/undergraduate_degrees_environmental.php">Environmental Studies</option><option value="http://eeo.ucf.edu/">Equal Opportunity/Affirmative Action Programs</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_events.main_display_sel?p_role=all">Events</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_events.main_display_sel?p_role=all">Events, Calendar of</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_events.main_display_sel?p_role=faculty">Events, Faculty</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_events.main_display_sel?p_role=prospective">Events, Prospective Students</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_events.main_display_sel?p_role=gpublic">Events, Public</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_events.main_display_sel?p_role=staff">Events, Staff</option><option value="http://www.ucf.edu/pls/CDWS/w4_bbs_events.main_display_sel?p_role=student">Events, Student</option><option value="http://www.bus.ucf.edu/edc/cgi-bin/site/sitew.cgi">Executive Development Center, Business Administration, College Of</option><option value="http://www.coop.ucf.edu/">Experiential Learning</option><option value="http://www.fp.ucf.edu/">Facilities Planning</option><option value="http://www.iroffice.ucf.edu/character/current.html">Facts About UCF</option><option value="http://www.iroffice.ucf.edu/faculty">Faculty Activity Reporting</option><option value="http://www.fctl.ucf.edu/">Faculty Center For Teaching And Learning</option><option value="http://www.provost.ucf.edu/handbook/home.html#colleges_centers_institutes">Faculty Handbook Institutes &amp; Centers Listing</option><option value="http://www.facultyrelations.ucf.edu/">Faculty Relations</option><option value="http://pegasus.cc.ucf.edu/~fsenate/">Faculty Senate, UCF</option><option value="http://universityrelations.ucf.edu/">Federal Relations , Office Of</option><option value="http://www.film.ucf.edu/">Film Department</option><option value="http://www.registrar.sdes.ucf.edu/calendar/exam/">Final Exam Schedule</option><option value="http://www.fa.ucf.edu/">Finance And Accounting</option><option value="http://www.bus.ucf.edu/finance/cgi-bin/site/sitew.cgi">Finance, Department Of, Business Administration, College Of</option><option value="http://finaid.ucf.edu/">Financial Aid</option><option value="http://www.firstyear.sdes.ucf.edu/">First Year Advising &amp; Exploration</option><option value="http://flare.ucf.edu/">Flare (Family Literacy And Reading Excellence)</option><option value="http://www.flboe.org/">Florida Board of Education</option><option value="http://www.international.ucf.edu/fcli/index.php">Florida Canada Linkage Institute</option><option value="http://www.international.ucf.edu/eeli/index.php">Florida Eastern Europe Linkage Institute</option><option value="http://feeds.ucf.edu/">Florida Engineering Education Delivery system(FEEDS)</option><option value="http://www.floridassef.net/">Florida Foundation for Future Scientists</option><option value="http://www.floridainclusionnetwork.com/">Florida Inclusion Network</option><option value="http://www.fiea.ucf.edu/">Florida Interactive Entertainment Academy</option><option value="http://fsec.ucf.edu/">Florida Solar Energy Center (F.S.E.C.)</option><option value="http://fsi.ucf.edu/">Florida Space Institute</option><option value="http://www.ncfs.org/home.html">Forensic Science, National Center For</option><option value="http://foundation.ucf.edu/">Foundation, Inc., UCF</option><option value="http://www.greeklife.sdes.ucf.edu/">Fraternity and Sorority Life</option><option value="http://www.generalcounsel.ucf.edu/">General Counsel</option><option value="http://games.bio.ucf.edu/">Geospatial Analysis And Modeling Of Ecological Systems Lab</option><option value="http://www.ucfglobalperspectives.org/">Global Perspectives, The Office of the Special Assistant to the President for</option><option value="http://gkc.ucf.edu/">Golden Knights Club</option><option value="http://www.goldenrule.sdes.ucf.edu/">Golden Rule (Student Conduct)</option><option value="http://www.downtown.ucf.edu/IOG.htm">Government, Institute Of</option><option value="http://universityrelations.ucf.edu/divisions/govt.html">Governmental Relations Department</option><option value="http://gradontrack.sdes.ucf.edu/">Grad On Track</option><option value="http://graduate.ucf.edu/">Graduate Admissions</option><option value="http://www.graduate.ucf.edu/catalog/">Graduate Catalog</option><option value="http://www.graduatecouncil.ucf.edu/">Graduate Council</option><option value="http://www.graduate.ucf.edu/sitemap/index.cfm?RsrcID=52&amp;SubCatID=123">Graduate Degrees &amp; Programs</option><option value="http://www.graduate.ucf.edu/gradonlineapp/">Graduate Online Application</option><option value="http://www.bus.ucf.edu/graduate/cgi-bin/site/sitew.cgi">Graduate Studies Office, Business Administration, College Of</option><option value="http://www.graduate.ucf.edu/">Graduate Studies, Division of</option><option value="http://mail.ucf.edu/">GroupWise Web Access</option><option value="http://www.provost.ucf.edu/handbook/home.html">Handbook, Faculty</option><option value="http://www.cohpa.ucf.edu/">Health &amp; Public Affairs, College Of</option><option value="http://www.cohpa.ucf.edu/health.pro/">Health Professions</option><option value="http://healthsciences.ucf.edu/">Health Sciences, UCF</option><option value="http://www.cohpa.ucf.edu/health.pro/athletic/">Health Sciences-Athletic Training</option><option value="http://www.hs.sdes.ucf.edu/">Health Services</option><option value="http://www.cohpa.ucf.edu/health.pro/hsams.cfm">Health Services Administration</option><option value="http://sfdm.ucf.edu/heritagealliance">Heritage Alliance</option><option value="http://pegasus.cc.ucf.edu/~history/">History Department</option><option value="http://www.cohpa.ucf.edu/honors/">Honors Program, College Of Health And Public Affairs</option><option value="http://www.hospitality.ucf.edu/">Hospitality Management, Rosen College Of</option><option value="http://search.travel.yahoo.com/bin/search/map?clat=28.587585045046&amp;clong=-81.20925327027&amp;zoom=8&amp;sid=191501911&amp;pop=0&amp;id=&amp;pan_x=&amp;pan_y=&amp;.done=http%3A%2F%2Ftravel.yahoo.com%2Fp%2Fhotel%2F191501911%2Fb%2F">Hotels - UCF Area</option><option value="http://www.housing.ucf.edu/">Housing &amp; Residence Life</option><option value="http://www.hr.ucf.edu/">Human Resources</option><option value="http://chdr.cah.ucf.edu/">Humanities and Digital Research, Center For</option><option value="http://www.ucf.edu/info/hurricane.php">Hurricane Resources and Information</option><option value="http://engineering.ucf.dev:3000/azindex/">Index, A-Z</option><option value="http://www.iems.ucf.edu/">Industrial Engineering &amp; Management Systems</option><option value="http://www.if.ucf.edu/">Information Fluency Initiative</option><option value="http://www.graduate.ucf.edu/inquiry/">Information Request, Graduate Students</option><option value="https://www.secure.sdes.ucf.edu/undergraduate_admissions/online-info-req.asp">Information Request, Undergraduate Students</option><option value="http://www.security.noc.ucf.edu/">Information Security Office</option><option value="http://itr.ucf.edu/">Information Technologies &amp; Resources</option><option value="http://iaa.ucf.edu/">Information, Analysis, And Assessment, Division of</option><option value="http://www.ist.ucf.edu/">Institute For Simulation &amp; Training (I.S.T.)</option><option value="http://www.iroffice.ucf.edu/institutes/index.html">Institutes &amp; Centers (Office of Institutional Research)</option><option value="http://www.research.ucf.edu/Centers/">Institutes and Centers (Office of Research)</option><option value="http://www.iroffice.ucf.edu/">Institutional Research, Office Of</option><option value="http://www.oir.ucf.edu/">Instructional Resources, Office of</option><option value="http://www.cohpa.ucf.edu/isat/">Instructional Support And Technology</option><option value="http://pegasus.cc.ucf.edu/~instsys">Instructional Systems Program</option><option value="http://www.cmms.ucf.edu/Intensive%20English.html">Intensive English Program</option><option value="http://www.cas.ucf.edu/iplay/index.php">Interactive Performance Lab</option><option value="http://www.universityaudit.ucf.edu/">Internal Audit</option><option value="http://www.intl.ucf.edu/">International Services Center</option><option value="http://www.international.ucf.edu/">International Studies, Office Of</option><option value="http://www.imsports.ucf.edu/">Intramural Sports</option><option value="http://www.ucf.edu/jobs/vacancies/">Job Vacancies</option><option value="http://www.cas.ucf.edu/judaic_studies/">Judaic Studies, Interdisciplinary Program In</option><option value="http://www.knightcast.org/">Knightcast</option><option value="http://www.businessservices.ucf.edu/knightwear/">Knightwear</option><option value="http://www.lead.sdes.ucf.edu/">L.E.A.D. Scholars Program</option><option value="http://www.cas.ucf.edu/LACLS/">Latin American, Caribbean, &amp; Latino Studies</option><option value="http://pegasus.cc.ucf.edu/~life-ucf">Learning Institute For Elders (LIFE) At UCF</option><option value="http://learn.ucf.edu/">Learning Online, UCF</option><option value="http://www.stulegal.sdes.ucf.edu/">Legal Services, Student</option><option value="http://www.is.ucf.edu/">Liberal &amp; Interdisciplinary Studies</option><option value="http://www.cas.ucf.edu/liberal_studies/graduate_index.php">Liberal Studies Graduate Program</option><option value="http://library.ucf.edu/">Libraries, University</option><option value="http://www.link.ucf.edu/">LINK First-Year Experience Program</option><option value="http://pegasus.cc.ucf.edu/~lmacad">Lockheed Martin/U.C.F Academy For Mathematics And Sciences</option><option value="http://www.loufrey.org/">Lou Frey Institute Of Politics And Government</option><option value="http://www.pp.ucf.edu/operationalservices/maintenance/">Maintenance</option><option value="http://www.bus.ucf.edu/mis">Management Information Systems, Department Of, Business Administration, College Of</option><option value="http://www.bus.ucf.edu/management/">Management, Department Of, Business Administration, College Of</option><option value="http://www.ucfmarchingknights.com/">Marching Band Department</option><option value="http://www.mca.ucf.edu/">Marketing, Communications, and Admissions</option><option value="http://www.bus.ucf.edu/marketing/">Marketing, Department Of, Business Administration, College Of</option><option value="http://reach.ucf.edu/~elemed2">Masters Programs In Elementary Education</option><option value="http://math.ucf.edu/~mathlab/">Math Lab</option><option value="http://pegasus.cc.ucf.edu/~mathed">Mathematics Education</option><option value="http://www.math.ucf.edu/">Mathematics, Department Of</option><option value="http://www.campusdish.com/en-US/CSS/UnivCentralFlorida">Meal Plans</option><option value="http://www.mmae.ucf.edu/">Mechanical, Materials &amp; Aerospace Engineering</option><option value="http://www.biomed.ucf.edu/index.php?tg=articles&amp;idx=More&amp;topics=23&amp;article=60">Medical Laboratory Sciences</option><option value="http://www.ppmedsociety.com/">Medical Society, Pre-Professional</option><option value="http://www.med.ucf.edu/">Medicine, College of</option><option value="http://metrocenter.ucf.edu/">Metropolitan Center for Regional Studies</option><option value="http://pegasus.cc.ucf.edu/~mpie/">Minority Programs In Education</option><option value="http://www.spc.ucf.edu/SPCMission.html">Mission &amp; Goals</option><option value="http://mll.cah.ucf.edu/">Modern Languages and Literatures</option><option value="http://www.biomed.ucf.edu/index.php?tg=articles&amp;idx=More&amp;topics=21&amp;article=26">Molecular Biology &amp; Microbiology</option><option value="http://www.mass.sdes.ucf.edu/">Multicultural Academic &amp; Support Services (M.A.S.S.)</option><option value="http://www.cmms.ucf.edu/">Multilingual Multicultural Studies, Center for</option><option value="http://www.cas.ucf.edu/music">Music</option><option value="http://www.ucf.edu/myorganization">My Organization</option><option value="http://my.ucf.edu/">myUCF</option><option value="http://nanotech.research.ucf.edu/">Nanotechnology Research</option><option value="http://www.ncasse.org/">National Consortium For Academics And Sports (N. C. A. S.)</option><option value="http://www.news.ucf.edu/">News And Information, UCF Department Of</option><option value="http://www.cohpa.ucf.edu/pubadm/pacerts.cfm">Non-Profit Management</option><option value="http://www.nursing.ucf.edu/">Nursing, College Of</option><option value="http://www.cas.ucf.edu/oasis/">Oasis (Office Of Academic Support &amp; Information Services)</option><option value="http://online.ucf.edu/courses_programs/programs.html">Off Campus College Credit Programs</option><option value="http://www.housing.ucf.edu/offcampus/">Off-Campus Student Services</option><option value="http://www.oir.ucf.edu/">Office of Instructional Resources</option><option value="http://www.ucfofficeplus.com/">Office Plus, U.C.F.</option><option value="http://pegasus.cc.ucf.edu/~ombuds/">Ombuds Office</option><option value="http://online.ucf.edu/index.html">Online at UCF</option><option value="http://www.oeas.ucf.edu/">Operational Excellence and Assessment Support</option><option value="http://www.creol.ucf.edu/">Optics &amp; Photonics: CREOL &amp; FPCE, College of</option><option value="http://president.ucf.edu/org_chart.html">Organizational Chart</option><option value="http://www.orientation.sdes.ucf.edu/">Orientation Services</option><option value="http://www.orlandorep.com/">Orlando Repertory Theatre</option><option value="http://www.shakespearefest.org/">Orlando-U.C.F Shakespeare Festival</option><option value="http://www.rec.ucf.edu/oadventure/OA.htm">Outdoor Adventure</option><option value="http://parents.sdes.ucf.edu/">Parent Resource Information</option><option value="http://parking.ucf.edu/">Parking Services</option><option value="http://www.cas.ucf.edu/art/Pave/">Partners In Art Education P.A.V.E.</option><option value="http://pegasus.cc.ucf.edu/">Pegasus</option><option value="http://www.cas.ucf.edu/philosophy/">Philosophy, Department Of</option><option value="http://www.ucf.edu/phonebook/">Phone &amp; Email Directory, Campus</option><option value="http://www.pp.ucf.edu/">Physical Plant</option><option value="http://www.cohpa.ucf.edu/health.pro/ptms.cfm">Physical Therapy</option><option value="http://www.physics.ucf.edu/">Physics</option><option value="http://pegasus.cc.ucf.edu/~pande/">Planning &amp; Evaluation</option><option value="https://my.ucf.edu/psp/PAPROD/EMPLOYEE/PAPROD/h/?tab=PAPP_GUEST">Polaris</option><option value="http://police.ucf.edu/">Police Department</option><option value="http://policies.ucf.edu/">Policies and Procedures Manual</option><option value="http://politicalscience.cos.ucf.edu/">Political Science</option><option value="http://132.170.180.18/home.htm">Postal Services</option><option value="http://www.biomed.ucf.edu/index.php?tg=articles&amp;idx=More&amp;topics=6&amp;article=3">Pre Health Professions Advisement Office</option><option value="http://president.ucf.edu/">President, Office Of</option><option value="http://www.ucfplc.com/ucfplc/index.cfm">Presidents Leadership Council</option><option value="http://www.printing.ucf.edu/">Printing Services</option><option value="http://provost.ucf.edu/solvers">Problem Solvers</option><option value="http://www.ucf.edu/programs/index.html">Programs</option><option value="http://reach.ucf.edu/~CENTRAL/">Project Central</option><option value="http://www.provost.ucf.edu/">Provost and Executive Vice President, Office Of</option><option value="http://psychology.cos.ucf.edu/">Psychology Department</option><option value="http://www.cohpa.ucf.edu/pubadm/">Public Administration</option><option value="http://www.cohpa.ucf.edu/pubaffphd/">Public Affairs, Ph.D. In</option><option value="http://www.purchasing.ucf.edu/">Purchasing, Division Of</option><option value="http://iaaweb.ucf.edu/qep/index.asp">Quality Enhancement Plan Development</option><option value="http://www.cohpa.ucf.edu/health.pro/radbs.cfm">Radiologic Sciences</option><option value="http://www.rec.ucf.edu/">Recreation and Wellness Center</option><option value="http://www.regionalcampuses.ucf.edu/">Regional Campuses</option><option value="http://www.registrar.ucf.edu/">Registrar, University</option><option value="http://regulations.ucf.edu/">Regulations, UCF</option><option value="http://www.research.ucf.edu/">Research &amp; Commercialization, Office Of</option><option value="http://pegasus.cc.ucf.edu/~rite">Research Initiative For Teaching Effectiveness</option><option value="http://www.cohpa.ucf.edu/research/">Research Office, C.O.H.P.A.</option><option value="http://www.cohpa.ucf.edu/research/index.cfm">Research Office, College of Health &amp; Public Affairs</option><option value="http://www.optics.ucf.edu/research/">Research Office, College of Optics &amp; Photonics</option><option value="http://pegasus.cc.ucf.edu/~ampac/research.html">Research, AMPAC</option><option value="http://yp.yahoo.com/py/ypResults.py?Pyt=Typ&amp;addr=4000+Central+Florida+Blvd.&amp;city=Orlando&amp;state=FL&amp;zip=32816-8005&amp;country=us&amp;msa=5960&amp;slt=28.597639&amp;sln=-81.203340&amp;cs=9&amp;tab=B2C&amp;stx=8903827&amp;stp=y&amp;doprox=">Restaurants, UCF Area</option><option value="http://hr.ucf.edu/web/benefits/Retirement_Assoc.shtml">Retirement Association, UCF</option><option value="http://www.physics.ucf.edu/robinson_index.php">Robinson Observatory</option><option value="http://www.mcnair.ucf.edu/">Ronald E. McNair Post Baccalaureate Achievement Program</option><option value="http://www.hospitality.ucf.edu/">Rosen College of Hospitality Management</option><option value="http://www.cs.ucf.edu/">School of Computer Science</option><option value="http://www.cos.ucf.edu/">Sciences, College of</option><option value="http://www.cos.ucf.edu/cosgraduate">Sciences, Graduate Student Web Site, College of</option><option value="http://www.iroffice.ucf.edu/forms/requestedforms.html">Security Authorization Form, UCF</option><option value="http://www.servicelearning.ucf.edu/">Serving -Learning</option><option value="http://parking.ucf.edu/Shuttle.html">Shuttle Bus, UCF</option><option value="http://www.bus.ucf.edu/sbdc/">Small Business Development Center</option><option value="http://www.cohpa.ucf.edu/social/">Social Work, School Of</option><option value="http://sociology.cos.ucf.edu/">Sociology</option><option value="http://www.sophomore.sdes.ucf.edu/">Sophomore and Second Year Center</option><option value="http://www.bus.ucf.edu/sport/">Sport Business Management , Business Administration, College Of</option><option value="http://stadium.ucf.edu/">Stadium, UCF</option><option value="http://universityrelations.ucf.edu/divisions/salga.html">State and Local Government Affairs Program</option><option value="http://statistics.cos.ucf.edu/">Statistics and Actuarial Science, Department of</option><option value="http://www.spc.ucf.edu/">Strategic Planning</option><option value="http://www.sarc.sdes.ucf.edu/">Student Academic Resource Center (SARC)</option><option value="http://www.osc.sdes.ucf.edu/">Student Conduct</option><option value="http://www.sdes.ucf.edu/">Student Development &amp; Enrollment Services</option><option value="http://www.sds.sdes.ucf.edu/">Student Disability Services</option><option value="http://finaid.ucf.edu/">Student Financial Assistance</option><option value="http://www.sga.ucf.edu/">Student Government Association</option><option value="http://www.osi.sdes.ucf.edu/">Student Involvement, Office Of</option><option value="http://www.slp.sdes.ucf.edu/">Student Leadership Programs</option><option value="http://www.reachout.sdes.ucf.edu/">Student Outreach Programs</option><option value="http://www.osrr.sdes.ucf.edu/">Student Rights And Responsibilities, Office Of</option><option value="http://pegasus.cc.ucf.edu/~stuservw/">Student Services, Office Of, College Of Education</option><option value="http://www.ssc.sdes.ucf.edu/">Student Success Center</option><option value="http://www.cohpa.ucf.edu/advising/">Student Support, Office Of (C.O.H.P.A.)</option><option value="http://www.bus.ucf.edu/oss/">Student Support, Office Of, Business Administration, College Of</option><option value="http://www.studentunion.ucf.edu/">Student Union</option><option value="http://www.ucf.edu/feedback/link.php">Suggest a link for this page</option><option value="http://www.ucfcard.ucf.edu/partners.shtml">Sun Trust</option><option value="http://www.sunlink.ucf.edu/">Sunlink</option><option value="http://education.ucf.edu/tlp">Teaching and Learning Principles</option><option value="http://www.tec.ucf.edu/">Technological Entrepreneurship Center</option><option value="http://edcollege.ucf.edu/techfac">Technology and Facilities-College of Education</option><option value="http://www.incubator.ucf.edu/">Technology Incubator</option><option value="http://www.teledata.ucf.edu/">Teledata Services</option><option value="http://www.testprep.ucf.edu/">Test Prep, UCF</option><option value="http://www.bus.ucf.edu/testinglab/">Testing Lab, College of Business</option><option value="http://www.cas.ucf.edu/theatre/">Theatre U.C.F. / Department of Theatre</option><option value="http://townandgown.ucf.edu/">Town &amp; Gown Council, UCF</option><option value="http://www.hr.ucf.edu/web/training/calendar.shtml">Training &amp; Professional Development, Human Resources</option><option value="http://training.ucf.edu/">Training, Faculty and Staff</option><option value="http://www.registrar.ucf.edu/forms/transcript_request/">Transcripts, Requesting</option><option value="http://www.transfer.sdes.ucf.edu/">Transfer and Transition Services</option><option value="http://www.fa.ucf.edu/">Travel</option><option value="http://www.iroffice.ucf.edu/character/current_tuition.html">Tuition and Fees, UCF</option><option value="http://foundation.ucf.edu/">UCF Foundation, Inc.</option><option value="http://foundation.ucf.edu/Main/Default.asp?CategoryID=2&amp;SubCategoryID=4">UCF History</option><option value="http://library.ucf.edu/InfoSource/">UCF Information Source</option><option value="http://www.ucftv.ucf.edu/">UCF TV</option><option value="http://holmes.ucf.edu/">UCF/OSC Holmes Partnership</option><option value="http://www.catalog.sdes.ucf.edu/">Undergraduate Catalog</option><option value="http://www.admissions.sdes.ucf.edu/apply-now.asp?FirstSub=internationalstudinfo">Undergraduate International Admissions</option><option value="http://www.catalog.sdes.ucf.edu/current/degree_programs/">Undergraduate Majors</option><option value="http://www.catalog.sdes.ucf.edu/current/minors/">Undergraduate Minors &amp; Certificates</option><option value="https://www.secure.sdes.ucf.edu/undergraduate_admissions/app_login.asp">Undergraduate Online Application</option><option value="http://www.honors.ucf.edu/Undergrad_Research.asp">Undergraduate Research , Burnett Honors College</option><option value="http://www.our.ucf.edu/">Undergraduate Research, Office of</option><option value="http://www.undergraduatestudies.ucf.edu/">Undergraduate Studies, Office of</option><option value="http://www.admissions.sdes.ucf.edu/apply-now.asp?FirstSub=officetransservstud">Undergraduate Transfer Admissions</option><option value="http://www.uffucf.org/">United Faculty Of Florida</option><option value="http://uaps.ucf.edu/">University Analysis And Planning Support, Office Of</option><option value="http://library.ucf.edu/SpecialCollections/Archives/">University Archives</option><option value="http://www.universityaudit.ucf.edu/">University Audit</option><option value="http://budget.ucf.edu/">University Budget Operations</option><option value="http://universityrelations.ucf.edu/economic_development/index.htm">University Economic Development</option><option value="http://universitymarketing.ucf.edu/">University Marketing</option><option value="http://universityrelations.ucf.edu/">University Relations</option><option value="http://www.testing.sdes.ucf.edu/">University Testing Center</option><option value="http://www.uwc.ucf.edu/">University Writing Center (UWC)</option><option value="http://www.uwc.ucf.edu/Grad%20Gateway/gg_home.htm">University Writing Centers Graduate Gateway</option><option value="http://helpdesk.ucf.edu/">User Services Help Desk</option><option value="http://pegasus.cc.ucf.edu/~uspsstaf/">USPS Staff Council</option><option value="http://www.va.ucf.edu/">Veteran Services</option><option value="http://president.ucf.edu/vice_president.html">Vice President and Chief of Staff</option><option value="http://www.research.ucf.edu/">Vice President for Research</option><option value="http://foundation.ucf.edu/">Vice President of Development and Alumni Relations and CEO UCF Foundation</option><option value="http://campusmap.ucf.edu/vicinity/">Vicinity Maps</option><option value="http://victimservices.ucf.edu/">Victim Services</option><option value="http://www.admissions.mca.ucf.edu/specific-content-h.asp?ctCatID=2004041217031087">Visiting UCF</option><option value="http://vic.ucf.edu/">Visitor Information Center</option><option value="http://reach.ucf.edu/~voced/">Vocational Education And Industry Training</option><option value="http://wucf.ucf.edu/">W.U.C.F. - F.M. Radio</option><option value="http://webcam.ucf.edu/">Web Cams, Campus</option><option value="http://reach.ucf.edu/~wdr/">Web Development Resources</option><option value="http://www.registrar.sdes.ucf.edu/weg/">Web Enrollment Guide</option><option value="http://webluis.fcla.edu/cgi-bin/cgiwrap/~fclwlv3/wlv3/CM02/DGgen/DBwebluis/P1home">Web Luis - Library</option><option value="http://webct.ucf.edu/">WebCT</option><option value="https://pegasus.cc.ucf.edu/webmail/">Webmail, Pegasus</option><option value="https://www.ucfcard.ucf.edu/webrevalue/">WebRevalue, ID Card</option><option value="http://pegasus.cc.ucf.edu/~wrcenter">Wellness Research Center</option><option value="http://wnsc.ucf.edu/shows.html">WNSC Campus Radio</option><option value="http://pegasus.cc.ucf.edu/~wise/">Women in Science and Engineering</option><option value="http://womensclub.ucf.edu/">Womens Club, U.C.F.</option><option value="http://www.cas.ucf.edu/womensresearch/">Womens Research Center</option><option value="http://www.cah.ucf.edu/womensstudies/">Womens Studies Program, Office Of Interdisciplinary Studies</option></select>'+
					'</div>'+
					'<div id="quicklinks-actions">'+
						'<ul>'+
							'<li><a href="#" id="addLinks">&gt;&gt;</a></li>'+
							'<li><a href="#" id="removeLinks">&lt;&lt;</a></li>'+
							'<li><a href="#" id="clearLinks">Clear</a></li>'+
							'<li><a href="#" id="closeLinks" onclick="customize()">Close</a></li>'+
						'</ul>'+
					'</div>'+
					'<div class="quicklinks-column">'+
						'<h3>Your Links</h3>'+
							'<select multiple="multiple" class="quicklinks-list" id="destinationLinks">'+
							'</select>'+
						'</div>'+
					'<div class="clear"></div>'+
				'</div>'+
			'</form>'+
			'</div>'+
		'</div>'+
		'<div class="UCFHBWrapper">'+
			'<div id="mainWrapper">'+
		'<div id="UCFtitle">'+
		'				<a href="http:\/\/www.ucf.edu\/">'+
		'				<span class="UCFHBText">University of Central Florida<\/span>'+
		'				<\/a>'+
		'			<\/div>'+
		'			<label for="UCFHeaderLinks">University Links<\/label>'+
		'			<label for="q">Search UCF<\/label>'+
		'			<div id="UCFHBSearch_and_links">'+
		'				'+
		'				<form id="UCFHBUni_links" action="" target="_top">'+
		'					<fieldset>'+
		'					   <select name="UniversityLinks" id="UCFHBHeaderLinks" onchange="quickLinks.quickLinksChanged()">'+
		'						<option value="">Quicklinks:<\/option>'+
		'						'+
		'	<option value="">- - - - - - - - - -<\/option>'+
		'					<\/select>'+
		'					<\/fieldset>'+
		'				<\/form>'+
		'				<div>'+
		'					<a id="UCFHBMy_ucf" href="#" onclick="myucf();">'+
		'						<span class="text">myUCF<\/span>'+
		'					<\/a>'+
		'				<\/div>'+
		'				'+
		'				<form id="UCFHBSearch_ucf" method="get" action="http:\/\/google.cc.ucf.edu\/search" target="_top">'+
		'					<fieldset> '+
		'						<input type="hidden" name="output" value="xml_no_dtd"\/>'+
		'						<input type="hidden" name="proxystylesheet" value="UCF_Main"\/>'+
		'						<input type="hidden" name="client" value="UCF_Main"\/>'+
		'						<input type="hidden" name="site" value="UCF_Main"\/>'+
		'						<input class="text" type="text" name="q" id="q" value="Search UCF" title="Search UCF" onfocus="clearDefault(this);" onblur="clearDefault(this);" \/> '+
		'						<input class="submit" type="image" alt="Search button" src="https:\/\/www.ucf.edu\/img\/arrow.png" \/>'+
		'					<\/fieldset>'+
		'				<\/form>'+
		'				<div id="UCFHBClearBoth"><\/div>'+
				
		'			<\/div>'+
		'			<\/div>'+
		'		<\/div>';
		// fill element with contents
		headerDiv.innerHTML = elementContent;

		
		quickLinks = new QuickLinksRenderer();
		quickLinks.init();
		quickLinks.populateQuickLinks();
		
	}

	// clear default contents of text fields on first click
	function clearDefault(element) 
	{
		if(element.value==element.title) {
		   element.value="";
		   element.style.color="#000";
		   return;
		}
		
		if(element.value=="") {
			
			if (element.title != "") {
				element.value = element.title;
				element.style.color="#999";
			} 
		}	
	}

	
	/*****  Cross platform DOM Ready Event ****/
	
	(function(i) {
  var u = navigator.userAgent.toLowerCase();
  var ie = /*@cc_on!@*/false;
  if (/webkit/.test(u)) {
    // safari
    timeout = setTimeout(function(){
			if ( document.readyState == "loaded" || 
				document.readyState == "complete" ) {
				i();
			} else {
			  setTimeout(arguments.callee,10);
			}
		}, 10); 
  } else if ((/mozilla/.test(u) && !/(compatible)/.test(u)) ||
             (/opera/.test(u))) {
    // opera/moz
    document.addEventListener("DOMContentLoaded",i,false);
  } else if (ie) {
    // IE
    (function (){ 
      var tempNode = document.createElement('document:ready'); 
      try {
        tempNode.doScroll('left'); 
        i(); 
        tempNode = null; 
      } catch(e) { 
        setTimeout(arguments.callee, 0); 
      } 
    })();
  } else {
    window.onload = i;
  }
})(GlobalUCFHeaderInit);

	/**** JSON Parse and Encode ****/
	
	/*
		http://www.JSON.org/json2.js
		2008-07-15
	
		Public Domain.
	
		NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	
		See http://www.JSON.org/js.html
	
	*/
	
	if ((!this.JSON) && (!Object.toJSON)) {
	
	// Create a JSON object only if one does not already exist. We create the
	// object in a closure to avoid creating global variables.
	
		JSON = function () {
	
			function f(n) {
				// Format integers to have at least two digits.
				return n < 10 ? '0' + n : n;
			}
	
			Date.prototype.toJSON = function (key) {
	
				return this.getUTCFullYear()   + '-' +
					 f(this.getUTCMonth() + 1) + '-' +
					 f(this.getUTCDate())      + 'T' +
					 f(this.getUTCHours())     + ':' +
					 f(this.getUTCMinutes())   + ':' +
					 f(this.getUTCSeconds())   + 'Z';
			};
	
			String.prototype.toJSON =
			Number.prototype.toJSON =
			Boolean.prototype.toJSON = function (key) {
				return this.valueOf();
			};
	
			var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
				escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
				gap,
				indent,
				meta = {    // table of character substitutions
					'\b': '\\b',
					'\t': '\\t',
					'\n': '\\n',
					'\f': '\\f',
					'\r': '\\r',
					'"' : '\\"',
					'\\': '\\\\'
				},
				rep;
	
	
			function quote(string) {
	
				escapeable.lastIndex = 0;
				return escapeable.test(string) ?
					'"' + string.replace(escapeable, function (a) {
						var c = meta[a];
						if (typeof c === 'string') {
							return c;
						}
						return '\\u' + ('0000' +
								(+(a.charCodeAt(0))).toString(16)).slice(-4);
					}) + '"' :
					'"' + string + '"';
			}
	
	
			function str(key, holder) {
	
				var i,          // The loop counter.
					k,          // The member key.
					v,          // The member value.
					length,
					mind = gap,
					partial,
					value = holder[key];
	
				if (value && typeof value === 'object' &&
						typeof value.toJSON === 'function') {
					value = value.toJSON(key);
				}
	
				if (typeof rep === 'function') {
					value = rep.call(holder, key, value);
				}
	
				switch (typeof value) {
				case 'string':
					return quote(value);
	
				case 'number':
	
					return isFinite(value) ? String(value) : 'null';
	
				case 'boolean':
				case 'null':
	
					return String(value);
	
				case 'object':
	
					if (!value) {
						return 'null';
					}
	
					gap += indent;
					partial = [];
	
					if (typeof value.length === 'number' &&
							!(value.propertyIsEnumerable('length'))) {
	
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null';
						}
	
						v = partial.length === 0 ? '[]' :
							gap ? '[\n' + gap +
									partial.join(',\n' + gap) + '\n' +
										mind + ']' :
								  '[' + partial.join(',') + ']';
						gap = mind;
						return v;
					}
	
					if (rep && typeof rep === 'object') {
						length = rep.length;
						for (i = 0; i < length; i += 1) {
							k = rep[i];
							if (typeof k === 'string') {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v);
								}
							}
						}
					} else {
	
						for (k in value) {
							if (Object.hasOwnProperty.call(value, k)) {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v);
								}
							}
						}
					}
	
					v = partial.length === 0 ? '{}' :
						gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
								mind + '}' : '{' + partial.join(',') + '}';
					gap = mind;
					return v;
				}
			}
	
	
			return {
				stringify: function (value, replacer, space) {
	
					var i;
					gap = '';
					indent = '';
	
	
					if (typeof space === 'number') {
						for (i = 0; i < space; i += 1) {
							indent += ' ';
						}
	
					} else if (typeof space === 'string') {
						indent = space;
					}
	
					rep = replacer;
					if (replacer && typeof replacer !== 'function' &&
							(typeof replacer !== 'object' ||
							 typeof replacer.length !== 'number')) {
						throw new Error('JSON.stringify');
					}
	
					return str('', {'': value});
				},
	
	
				parse: function (text, reviver) {
	
					var j;
	
					function walk(holder, key) {
	
						var k, v, value = holder[key];
						if (value && typeof value === 'object') {
							for (k in value) {
								if (Object.hasOwnProperty.call(value, k)) {
									v = walk(value, k);
									if (v !== undefined) {
										value[k] = v;
									} else {
										delete value[k];
									}
								}
							}
						}
						return reviver.call(holder, key, value);
					}
	
					cx.lastIndex = 0;
					if (cx.test(text)) {
						text = text.replace(cx, function (a) {
							return '\\u' + ('0000' +
									(+(a.charCodeAt(0))).toString(16)).slice(-4);
						});
					}
	
	
					if (/^[\],:{}\s]*$/.
	test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
	replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
	replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	
	
						j = eval('(' + text + ')');
	
	
						return typeof reviver === 'function' ?
							walk({'': j}, '') : j;
					}
	
					throw new SyntaxError('JSON.parse');
				}
			};
		}();
	}

				
	// QuickLinksRenderer
	// -----------------------------------------------
	// Renders contents of Quicklinks menu. 
	//
	// Designed for use on external sites
	//
	// Configuration options at bottom of class definition
	
	function QuickLinksRenderer() {
				
		
		this.init = function() { 
			//Customization URL
			this.selectEl = document.getElementById("UCFHBHeaderLinks");
			
			// cookie jar options
			this.options = {
				cookie: {
					expires: 630720,
					path: "/",
					domain: ".ucf.edu"
				},
				cacheCookie:    true,
				cookiePrefix:   'jqCookieJar_',
				debug:          false
			};
			this.name = "quicklinks";
			this.cookieName = this.options.cookiePrefix + this.name;
			this.jarRoot = {quickLinkData:{links:[]}};
			this.links = new Array();
		}
		
		this.quickLinksChanged = function(selectElement){
			
			var linkURL = this.selectEl.options[this.selectEl.selectedIndex].value;
			if (linkURL ==">") {customize(); return;}
			if (linkURL == "+") {this.addCurrentPage();return;}
			if (linkURL != ""){document.location = linkURL;}
			else { selectElement.selectedIndex=0;}

		};
		
		
		/* Cookie methods based on jQuery cookie plugin
 		*
 		* Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 		* Dual licensed under the MIT and GPL licenses:
 		* http://www.opensource.org/licenses/mit-license.php
 		* http://www.gnu.org/licenses/gpl.html
		*/
		
		this.cookie = function(name, value, options) {
			if (typeof value != 'undefined') { // name and value given, set cookie
				options = options || {};
				if (value === null) {
					value = '';
					options.expires = -1;
				}
				var expires = '';
				if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
					var date;
					if (typeof options.expires == 'number') {
						date = new Date();
						date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
					} else {
						date = options.expires;
					}
					expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
				}
				var path = options.path ? '; path=' + options.path : '';
				var domain = options.domain ? '; domain=' + options.domain : '';
				var secure = options.secure ? '; secure' : '';
				document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
			} else { // only name given, get cookie
				var cookieValue = null;
				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = (cookies[i] || "").replace( /^\s+|\s+$/g, "" );
						// Does this cookie string begin with the name we want?
						if (cookie.substring(0, name.length + 1) == (name + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
							break;
						}
					}
				}
				return cookieValue;
			}
		};
		
		
		this.sortAlpha = function (anArray)
		{
			if (anArray.sort) {
				return anArray.sort( function(a,b)  { return (a.name.toLowerCase() < b.name.toLowerCase() ) ? -1 : 1; });
			} else {
				return anArray;
			}
		},
	
		
		this.loadQuickLinksData = function() {
		
			jsonString = this.cookie(this.cookieName);
			
			if (typeof jsonString == 'string') {
				// If using Prototype, we must use it's JSON implementation
				if (Object.toJSON) {
					this.jarRoot = jsonString.evalJSON();		
				} else {
					this.jarRoot = JSON.parse(jsonString, true);
				}
			} 
						
			if (this.jarRoot.quickLinkData && this.jarRoot.quickLinkData.links) {
				this.links = this.sortAlpha(this.jarRoot.quickLinkData.links);
			} else {
				this.jarRoot = {quickLinkData:{links:[]}};
				this.links = new Array();
			}
		};
		
		this.addCurrentPage = function() {
		
			userTitle = prompt ("Save this page as:",document.title);
			if (userTitle != null && userTitle != "")
			{				
				newTitle = userTitle;
				
				oldLinks = this.links.concat();
				
				this.links.push({url: document.URL, name: newTitle});
				this.links = this.sortAlpha(this.links);
				
				if (this.saveQuickLinksData()) {				
					this.populateQuickLinks();
				} else {
					alert("Maximum number of links exceeded.");
					this.links = oldLinks;
				}
			}
	
			// reset menu
			this.selectEl.selectedIndex=0;
			return false;
		},

		
		this.populateQuickLinks = function () {	
		
			this.loadQuickLinksData();
			
			selectEl = this.selectEl;
			
			selectEl.options.length = 2;
						
			selectEl.options.add(new Option("Libraries", "http://library.ucf.edu"));
			selectEl.options.add(new Option("Directories (A-Z Index)", "http://www.ucf.edu/directories/"));
			selectEl.options.add(new Option("Campus Map", "http://campusmap.ucf.edu"));
			selectEl.options.add(new Option("Giving to UCF", "http://foundation.ucf.edu/Main/"));
			selectEl.options.add(new Option("Ask UCF", "http://ask.ucf.edu"));
			selectEl.options.add(new Option("Financial Aid", "http://finaid.ucf.edu/"));
			selectEl.options.add(new Option("Parents", "http://parents.sdes.ucf.edu/"));
			selectEl.options.add(new Option("- - - - - - - - - -", ""));
			selectEl.options.add(new Option("Academics", "http://www.ucf.edu/academics"));
			selectEl.options.add(new Option("Admissions", "http://www.ucf.edu/admissions"));
			selectEl.options.add(new Option("Research", "http://www.ucf.edu/research/"));
			selectEl.options.add(new Option("Locations", "http://www.ucf.edu/locations/"));
			selectEl.options.add(new Option("Campus Life", "http://www.ucf.edu/campus_life/"));
			selectEl.options.add(new Option("Alumni & Friends", "http://www.ucf.edu/alumni_and_friends/"));
			selectEl.options.add(new Option("Athletics", "http://www.ucf.edu/athletics/"));
			selectEl.options.add(new Option("- - - - - - - - - -", ""));
								
			if (this.links.length > 0 )
			{
				// append user links
				for (var i = 0; i < this.links.length; i++) 
  				{
     				selectEl.options.add(new Option(this.links[i].name,this.links[i].url));
				}
				
				// append divider and Add This Page option
				selectEl.options.add(new Option("- - - - - - - - - -", ""));
			}
			
			selectEl.options.add(new Option("+ Add This Page", "+"));
			selectEl.options.add(new Option("- - - - - - - - - -", ""));
			selectEl.options.add(new Option("> Customize This List", ">"));
		}		
		
		this.saveQuickLinksData = function(){
		
			this.jarRoot.quickLinkData.links = this.links;
			
			newJSONString = '';
			
			//if using prototype, we must use it's JSON implementation 
			if(Object.toJSON){
				newJSONString = Object.toJSON(this.jarRoot);				
			} else {
				newJSONString = JSON.stringify(this.jarRoot);
			} 
			
			if(newJSONString.length >4000) { return false; }
			
			this.cookie(this.cookieName, newJSONString, this.options.cookie);
			return true;

		};
		
		
	};	
	
	// clear default contents of text fields on first click
	function clearDefault(element) 
	{
	
		if(element.value==element.title) {
		   element.value="";
		   element.style.color="#000";
		   return;
		}
		
		if(element.value=="") {
			
			if (element.title != "") {
				element.value = element.title;
				element.style.color="#999";
			} 
		}	
	}


