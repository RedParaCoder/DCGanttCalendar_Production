import {IInputs, IOutputs} from "./generated/ManifestTypes";
import 'jquery';
import 'popper.js';
import 'bootstrap';
import '../node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { wrap } from "module";


//custom implementations

interface assignmentType {id: number, subject: string, title: string, start: Date, end: Date, description: string, canEdit: boolean};


export class DCGanttCalendar implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    /**
     * Empty constructor.
     */
    //Main html elements
    //the main element to be used as body for component.
    private main: HTMLDivElement;
    
    private properties: HTMLDivElement;
    private subjectDisplay: HTMLDivElement; //subjects ui
    private dateDisplay: HTMLDivElement; //dates ui
    private assignmentContainer: HTMLDivElement; //assignments ui 
    private scope: HTMLDivElement; //scope ui
    private styleElm: HTMLStyleElement;

    //recurring main sub elements
    private subjBdy: HTMLTableSectionElement;
    private dateTr: HTMLTableRowElement;
    private scopeBdy: HTMLTableSectionElement;
    private asgnTblBody: HTMLTableSectionElement;
    private subjToggle: HTMLInputElement;

    //End of main elements
    //standard values for calendar properties
    private dc_props = {
        dates: {
            count: 7,
        },
        subjects:{
            count: 5,
        }
    }


    //custom variables for use throughout

    

    
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        
        var s_dateS = new Date("2023/8/25");
        var s_dateE = new Date("2023/10/1");
        var s_subj = [["Welding", 1], ["Lathing", 2], ["Drilling", 3]];
        var s_asgn: assignmentType[] = [
            {id: 1, subject: "Welding", title: "Stick weld", start: new Date("08.25.2023"), end: new Date("08.29.2023"), description: "Usage of Stick weld to combine two plates into one.", canEdit: true},
            {id: 2, subject: "Welding", title: "Tig Weld", start: new Date("08.25.2023"), end: new Date("08.29.2023"), description: "Usage of Tig weld to combine two plates into one.", canEdit: false},
            {id: 3, subject: "Lathing", title: "Cone", start: new Date("08.29.2023"), end: new Date("09.07.2023"), description: "Usage of Lathe to create a cone on a work piece.", canEdit: false},
            {id: 4, subject: "Drilling", title: "Centering", start: new Date("08.29.2023"), end: new Date("09.05.2023"), description: "Usage of Stick weld to combine two plates into one.", canEdit: false},
            {id: 5, subject: "Drilling", title: "Punching", start: new Date("08.29.2023"), end: new Date("09.05.2023"), description: "How to properly preform punches.", canEdit: false},
            {id: 6, subject: "Lathing", title: "Zeroing", start: new Date("08.29.2023"), end: new Date("09.05.2023"), description: "How to configure nulling on a lathe.", canEdit: false},
            {id: 8, subject: "Welding", title: "Smort", start: new Date("08.27.2023"), end: new Date("08.30.2023"), description: "Different ways of becoming smart!", canEdit: false},
            {id: 7, subject: "Welding", title: "Cutting", start: new Date("08.26.2023"), end: new Date("08.27.2023"), description: "Different ways of cutting into steel e.g. Plastma, Torch, Saw.", canEdit: false},
            {id: 9, subject: "Welding", title: "Smorter", start: new Date("08.30.2023"), end: new Date("09.2.2023"), description: "Different ways of becoming smartER!", canEdit: false},
        ];
        //lets the resize of the component inside power apps update the container value on resize
        context.mode.trackContainerResize(true);
        //creation and assigning to main element variables.
        this.main = container; this.main.classList.add("mainBody");
        this.properties = this.main.appendChild(document.createElement("div")); this.properties.classList.add("properties", "dcProperties");
        this.subjectDisplay = this.main.appendChild(document.createElement("div")); this.subjectDisplay.classList.add("subjectDisplay");
        this.dateDisplay = this.main.appendChild(document.createElement("div")); this.dateDisplay.classList.add("dateDisplay");
        this.assignmentContainer = this.main.appendChild(document.createElement("div")); this.assignmentContainer.classList.add("assignmentContainer", "asgnContainer");
        this.scope = this.main.appendChild(document.createElement("div")); this.scope.classList.add("scope");
        //creation of main elements structure
        //dates
        var dateTbl = this.dateDisplay.appendChild(document.createElement("table"));
        dateTbl.classList.add("table", "table-dark", "dateTable"); dateTbl.id = "dateTable";
        var dateHed = dateTbl.appendChild(document.createElement("thead"));
        this.dateTr = dateHed.insertRow();
        this.dateTr.setAttribute("scope", "row");
        this.dateResizeEvent.observe(this.dateDisplay);

        //subjects
        var subjTbl = this.subjectDisplay.appendChild(document.createElement("table"));
        subjTbl.classList.add("table", "table-dark", "subjectTable");
        this.subjBdy = subjTbl.createTBody();
        //subjects > toggle visibility
        this.subjToggle = this.subjectDisplay.appendChild(document.createElement("input"));
        this.subjToggle.type = "checkbox";
        this.subjToggle.classList.add("subjToggle");
        this.main.addEventListener('scroll', (ev)=>{this.subjToggle.style.marginTop = this.main.scrollTop + 'px';});
        this.subjToggle.classList.add("bi", "bi-chevron-right");
        this.subjToggle.addEventListener("click", ((ev)=>{
            setTimeout(async()=>{
                console.log("gridTC "+parseFloat(getComputedStyle(this.main).gridTemplateColumns.split(' ')[0]))
                console.log((context.mode.allocatedWidth - 8) - (parseFloat(getComputedStyle(this.main).gridTemplateColumns.split(' ')[0])))
                console.log(this.dc_props.dates.count)
                document.documentElement.style.setProperty('--dayWidth', `${((context.mode.allocatedWidth - 8) - (parseFloat(getComputedStyle(this.main).gridTemplateColumns.split(' ')[0])))/this.dc_props.dates.count}px`);
            }, 300)
            //document.documentElement.style.setProperty('--dayWidth', ((context.mode.allocatedWidth - (document.querySelector(".subjectDisplay") as HTMLElement).getBoundingClientRect().width))/(this.dc_props.dates.count)+'px');
        }));

        //properties
        var drdBtn = this.properties.appendChild(document.createElement("button"));
        drdBtn.classList.add("btn", "btn-secondary", "dropdown-toggle");
        drdBtn.setAttribute("type", "button");
        drdBtn.setAttribute("data-bs-toggle", "dropdown");
        drdBtn.setAttribute("aria-expanded", "false");
        var drdBtnText = drdBtn.appendChild(document.createElement("i"));
        drdBtnText.classList.add("bi", "bi-gear");
        drdBtnText.textContent = "Properties";
        drdBtn.style.width = "100%";

        var drdUl = this.properties.appendChild(document.createElement("ul"));
        drdUl.classList.add("dropdown-menu", "dropdown-menu-dark");
        var addProperty = function(parent:HTMLElement, elm:string, classes?:string[]): HTMLElement{
            var elmName: string = elm;
            var propLi = parent.appendChild(document.createElement("li"));
            var retElm: HTMLElement = HTMLElement.prototype;
            if(elm == "bs-dv"){
                retElm = propLi.appendChild(document.createElement("hr"));
                retElm.classList.add("dropdown-divider");
                retElm = retElm;
            }else{
            retElm = propLi.appendChild(document.createElement(elm));
            retElm.classList.add("dropdown-item");
            }
            classes?.forEach(className => {
                retElm.classList.add(className);
            });
            return retElm;
        }
        var dayPropCount = addProperty(drdUl, "form");
        var dpDiv = dayPropCount.appendChild(document.createElement("div"));
        dpDiv.classList.add("form-group");
        var dpLable = dpDiv.appendChild(document.createElement("label"))
        dpLable.setAttribute("for", "dayIncrementer");
        dpLable.textContent = "Days";
        var dayInc = dpDiv.appendChild(document.createElement("input"));
        dayInc.classList.add("form-control", "dayInc");
        dayInc.id = "dayIncrementer";
        dayInc.setAttribute("type", "number");
        dayInc.step = "1";
        dayInc.min = "3";
        dayInc.value="7";
        addProperty(drdUl, "bs-dv");

        //assignments
        var asgnTbl = this.assignmentContainer.appendChild(document.createElement("table"));
        asgnTbl.id = "assignmentTable";
        asgnTbl.classList.add("table", "table-dark", "subjTable");
        this.asgnTblBody = asgnTbl.appendChild(document.createElement("tbody"));

        //scope
        var scopeL = this.scope.appendChild(document.createElement("div")); scopeL.classList.add("navLeft");
        var scopeNLEnd = scopeL.appendChild(document.createElement("button"));
        scopeNLEnd.classList.add("btn", "btn-secondary");
        scopeNLEnd.innerHTML = "<i class='bi bi-chevron-bar-left'></i>";
        scopeNLEnd.setAttribute("title", "Start");
        var scopeNLJump = scopeL.appendChild(document.createElement("button"));
        scopeNLJump.classList.add("btn", "btn-secondary");
        scopeNLJump.innerHTML = "<i class='bi bi-chevron-double-left'></i>";
        scopeNLJump.setAttribute("title", "Jump");
        var scopeNLStep = scopeL.appendChild(document.createElement("button"));
        scopeNLStep.classList.add("btn", "btn-secondary");
        scopeNLStep.innerHTML = "<i class='bi bi-chevron-left'></i>";
        scopeNLStep.setAttribute("title", "Step");


        var scopeM = this.scope.appendChild(document.createElement("div")); scopeM.classList.add("scopeMain");
        var scopeTbl = scopeM.appendChild(document.createElement("table"));
        this.scopeBdy = scopeTbl.createTBody();


        var scopeR = this.scope.appendChild(document.createElement("div")); scopeR.classList.add("navRight");
        var scopeNRStep = scopeR.appendChild(document.createElement("button"));
        scopeNRStep.classList.add("btn", "btn-secondary");
        scopeNRStep.innerHTML = "<i class='bi bi-chevron-right'></i>";
        scopeNRStep.setAttribute("title", "Step");
        var scopeNRJump = scopeR.appendChild(document.createElement("button"));
        scopeNRJump.classList.add("btn", "btn-secondary");
        scopeNRJump.innerHTML = "<i class='bi bi-chevron-double-right'></i>";
        scopeNRJump.setAttribute("title", "Jump");
        var scopeNREnd = scopeR.appendChild(document.createElement("button"));
        scopeNREnd.classList.add("btn", "btn-secondary");
        scopeNREnd.innerHTML = "<i class='bi bi-chevron-bar-right'></i>";
        scopeNREnd.setAttribute("title", "End");
        
        //style by script calculations

        var styleCode = document.createElement("style");
        styleCode.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(styleCode);
        this.styleElm = styleCode;

        //main structure end

        //generate sample data(this is also the way to generate after updateView is called?)
        
        //generate dates
        this.dc_generate.dates(s_dateS, s_dateE);
        //generate subjects
        this.dc_generate.subjects(s_subj);
        //generate assignments
        this.dc_generate.assignments(s_asgn);
        //sort assignments!
        this.dc_sort.assignments();
        //calculate height for subject by assignments
        this.dc_layout.subjHeight();

        //set observer on first date cell

    }

    private dCellResizeEvent = new ResizeObserver((ents) => {
        var dayW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dayWidth"));
        var styleText = "tr.subject:nth-child(odd){background: repeating-linear-gradient( 90deg, rgb(125, 125, 125), rgb(75, 75, 75) "+ dayW/2 +"px, rgb(50, 50, 50) "+ dayW/2 +"px, rgb(110, 110, 110) "+ dayW +"px ) !important;}\n";
        styleText+= "tr.subject{ background: repeating-linear-gradient( 90deg, rgb(150, 150, 150), rgb(100, 100, 100) "+ dayW/2 +"px, rgb(75, 75, 75) "+ dayW/2 +"px, rgb(135, 135, 135) "+ dayW +"px ); }"

        this.styleElm.innerHTML = styleText;
    });
    private dateResizeEvent = new ResizeObserver((ents)=>{
        for(let ent of ents){
            var subjs = (document.querySelectorAll("tr.subject"))
            subjs.forEach((subj) => {
                (subj as HTMLElement).style.width = ent.contentRect.width + 'px';
            })
        }
    });
    private subjResizeEvent = new ResizeObserver((ents)=>{ //subject display resize event observer
        //DCGanttCalendar.css -> ".asgnContainer table.subjTable tbody tr.subject" -> "/* Height handled by javascript */".
        for(let ent of ents){
            let subj = ent.target;
            let subjId = subj.id.replace(/\D/g, '');
            let tElm = (document.getElementById("asgnSubj-" + subjId) as HTMLElement); //TODO: Fix Wrapper that has Wrapper not overlapping!
            try{
                tElm.style.height = ent.contentRect.height + 'px';
            } catch(e){

            }
        }
    });

    private dc_layout = {
        subjHeight: ()=>{
            this.subjBdy.querySelectorAll("tr").forEach((subj) => {
                var subjId = subj.id.replace(/\D/g, '');
                var tElm = (document.getElementById("asgnSubj-" + subjId) as HTMLElement);
                var maxChildCount = 1;
                tElm.querySelectorAll(".asgnWrapper").forEach((wrapper) => {
                    if(maxChildCount < wrapper.childNodes.length){maxChildCount = wrapper.childNodes.length}
                    subj.style.height = (maxChildCount * parseFloat(getComputedStyle(document.documentElement).fontSize))*2.56 + 'px';
                });
            });
        }
    }
    
    private dc_sort = {
        assignments: ()=>{
            var getDates = function(dur:number, date:Date){ //function for creating dates from a start point til number provided
                var dateCollection:number[] = [];
                for(var d = 0; d <= dur; d++){ //for duration of assignment >
                    dateCollection.push(new Date((new Date(date).setDate(date.getDate()+d))).getTime()); //push the start date incremented by d into placeholder
                }
                return dateCollection;
            }
            var subj = document.querySelectorAll(".assignmentContainer table#assignmentTable tbody tr"); //get all subjects
            for(var i = 0; i < subj.length; i++){ //for all subjects >
                var asgnElms = subj[i].querySelectorAll("td.assignment"); //get all assignments >
                subj[i].innerHTML = ''; //clear subject tr (cleanup step for sorting)
                asgnElms.forEach((elm)=>{ //for every assignments (cleanup step for sorting)
                    subj[i].appendChild(elm) //set place assignment into its subject (cleanup step for sorting)
                });//cleanup Ready for sorting!
                var wrappedAssignments:Element[] = [];
                asgnElms.forEach((asgn) => { //for every assignment under the subject >
                    var start = new Date((asgn.getAttribute("start") as string)); //get start date of assignment
                    var end = new Date((asgn.getAttribute("end") as string)); //get end date of assignment
                    var duration = Math.ceil(Math.abs((end.getTime() - start.getTime()) / (1000*60*60*24))); //get difference in days end - start
                    var asgnDates:number[] = getDates(duration, start); //create placeholder for the assignments dates
                    asgnElms.forEach((asgnSibl) => { //for each assignments under the subject >
                        if(asgn != asgnSibl){ //if asgn is not asgnSibl //if element is not the current assignment >
                            var siblStart = new Date((asgnSibl.getAttribute("start") as string)); //get start date of sibling
                            var siblEnd = new Date((asgnSibl.getAttribute("end") as string)); //get end date of sibling
                            var siblDur = Math.ceil(Math.abs((siblEnd.getTime() - siblStart.getTime()) / (1000*60*60*24))); //get difference in days siblEnd - siblStart
                            var siblDates:number[] = getDates(siblDur, siblStart); //create placeholder for the siblings dates
                            
                            if(asgnDates.some(item => siblDates.includes(item))){
                                var wrapClass = "asgnWrapper"; //used to set class and identify wrappers
                                var sPar = (asgnSibl.parentElement as HTMLElement); //get siblings parent element
                                var aPar = (asgn.parentElement as HTMLElement); //get assignments parent element

                                if(asgn.parentElement?.classList.contains(wrapClass) || asgnSibl.parentElement?.classList.contains(wrapClass)){
                                    var toAppend = asgn;
                                    var appendTo = sPar;
                                    if(asgn.parentElement?.classList.contains(wrapClass)){toAppend = asgnSibl; appendTo = aPar;}
                                    appendTo.appendChild(toAppend);
                                }else{
                                    var wrapper = subj[i].appendChild(document.createElement("div"));
                                    wrapper.classList.add(wrapClass);
                                    wrapper.appendChild(asgnSibl);
                                    wrapper.appendChild(asgn);
                                }
                            }
                        }
                    });
                });
                var wrppers = subj[i].querySelectorAll(".asgnWrapper"); //get all wrappers within the subject
                wrppers.forEach((wrpp) => { //for every wrapper
                    wrpp.querySelectorAll(".assignment").forEach((elm) => { //for each assignment in current wrapper
                        var asgn = (elm as HTMLElement); //turn dom into element
                        var start = new Date((asgn.getAttribute("start") as string));
                        var end = new Date((asgn.getAttribute("end") as string));
                        var dur = Math.ceil(Math.abs((end.getTime() - start.getTime()) / (1000*60*60*24)));
                        var dates:number[] = getDates(dur, start);
                        wrpp.querySelectorAll(".assignment").forEach((elmSibl) => { //for each sibling
                            if(elm != elmSibl){ //make sure we're not self
                                var sibl = (elmSibl as HTMLElement); //turn dom into element
                                var siblStart = new Date((sibl.getAttribute("start") as string));
                                var siblEnd = new Date((sibl.getAttribute("end") as string));
                                var siblDur = Math.ceil(Math.abs((siblEnd.getTime() - siblStart.getTime()) / (1000*60*60*24)));
                                var siblDates:number[] = getDates(siblDur, siblStart);
                                if(!dates.some(item => siblDates.includes(item))){ //if sibling and assignment doesn't share any dates within the same wrapper
                                    var peaceClass = "peace"
                                    var asgnPar = asgn.parentElement;
                                    var siblPar = sibl.parentElement;
                                    if((asgnPar?.classList.contains(peaceClass) || siblPar?.classList.contains(peaceClass))){ //if either have parent with class peace
                                        if((asgnPar?.classList.contains(peaceClass) && siblPar?.classList.contains(peaceClass)) == false){ //if both parents aren't peace
                                            var peaceDiv = asgnPar as HTMLElement;
                                            var toAppend = sibl;
                                            var toADates = siblDates;
                                            if(siblPar?.classList.contains(peaceClass)){peaceDiv = siblPar; toAppend = asgn; toADates = dates;}
                                            var peaceDates:number[] = [];
                                            peaceDiv.querySelectorAll(".assignment").forEach((peaceElm) => { //for every assignment in peace div
                                                var pStart = new Date((peaceElm.getAttribute("start") as string));
                                                var pEnd = new Date((peaceElm.getAttribute("end") as string));
                                                var pDur = Math.ceil(Math.abs((pEnd.getTime() - pStart.getTime()) / (1000*60*60*24)));
                                                var pDates = getDates(pDur, pStart);
                                                peaceDates = peaceDates.concat(pDates); //add all dates within the peace div that the assignments use
                                            });
                                            if(!toADates.some(item => peaceDates.includes(item))){ //if dates doesn't exist in any of the assignments inside the peace div
                                                peaceDiv.appendChild(toAppend); //add to peace div
                                            }
                                        }
                                    }
                                    else{
                                        var peacer = wrpp.insertBefore(document.createElement("div"), wrpp.childNodes[0]);
                                        peacer.classList.add(peaceClass);
                                        peacer.appendChild(sibl);
                                        peacer.appendChild(asgn);
                                    }
                                }
                            }
                        });
                    });
                });
            }
        },
        assignments_test: ()=>{
            var subj = document.querySelectorAll(".assignmentContainer table#assignmentTable tbody tr");
            for(var i = 0; i < subj.length; i++){
                var asgnmnts = subj[i].querySelectorAll("td.assignment");
                subj[i].textContent = "";
                var asgnSibl: [Element, Date[]][] = [];
                asgnmnts.forEach((asgn) => {
                    var asgnStart = new Date((asgn.getAttribute("start") as string));
                    var asgnEnd = new Date((asgn.getAttribute("end") as string));
                    var asgnDur = Math.ceil(Math.abs(asgnEnd.getTime() - asgnStart.getTime()) / (1000*60*60*24));
                    
                    var itsDates: Date[] = [];
                    for(let j = 0; j < asgnDur; j++){
                        itsDates.push(new Date((new Date(asgnStart).setDate(asgnStart.getDate()+j))));
                    }
                    subj[i].appendChild(asgn);
                    asgnSibl.push([asgn, itsDates]);
                });
                var handledSibl: [Element, Date[]][] = [];
                var wrapClass = "asgnWrapper";
                asgnSibl.forEach((node) =>{
                    var nElm = node[0];
                    asgnSibl.forEach((sibl)=>{
                        var sElm = sibl[0];
                        if(node[0] != sibl[0]){
                            var nPar = nElm.parentElement;
                            var sPar = sElm.parentElement;
                            if(node[1].some(r=> sibl[1].includes(r))){
                                //check if parent is wrapper && not same parent wrapper
                                //check if one of them has a parent that is a wrapper -> add new wrapper to old wrapper and contain the sibl and node in the same
                                //check if both elements are wrapped -> wrap their wrappers in a new wrapper
                                if(nElm.parentElement?.classList.contains(wrapClass) || sPar?.classList.contains(wrapClass)){ //are any of the parents wrappers?
                                    if(sPar?.classList.contains(wrapClass) && nPar?.classList.contains(wrapClass)){ //does both have wrappers?
                                        if(sPar != nPar){ //is the wrapper not the same wrapper?
                                            var wrapWrap = sPar?.parentElement?.appendChild(document.createElement("div"));
                                            (wrapWrap as HTMLElement).classList.add(wrapClass);
                                            (wrapWrap as HTMLElement).appendChild(nElm);
                                            (wrapWrap as HTMLElement).appendChild(sElm);
                                        }else{}//element already wrapped! 
                                    }else{ 
                                        var parToUse = sPar;
                                        if(nPar?.classList.contains(wrapClass)){parToUse = nPar}
                                        var wrapChild = parToUse?.appendChild(document.createElement("div"));
                                        wrapChild?.classList.add(wrapClass);
                                        (wrapChild as HTMLElement).appendChild(sElm);
                                        (wrapChild as HTMLElement).appendChild(nElm);
                                    }
                                }else{ //none of the have wrapper as a parent
                                    var wrapAsgns = nPar?.appendChild(document.createElement("div"));
                                    (wrapAsgns as HTMLElement).classList.add(wrapClass);
                                    (wrapAsgns as HTMLElement).appendChild(nElm);
                                    (wrapAsgns as HTMLElement).appendChild(sElm);
                                }
                            }else{}
                        }else{}
                    });
                });
            }
        }
    }

    private dc_generate = {
        dates: (start: Date, end: Date) =>{
            if(start > end){console.log("dc_generate dates[error]: start is grater or equal to end!"); return false;}
            var dateControll = new Date(start);
            for(let i = 0; dateControll < end; i++){
                var itsDay: Date = new Date(start);
                itsDay.setDate(start.getDate()+i);
                dateControll = itsDay;
                var dateCell = this.dateTr.appendChild(document.createElement("th"));
                dateCell.setAttribute("title", itsDay.toDateString());
                dateCell.textContent = itsDay.toLocaleDateString('default', {day: '2-digit'}) + ". " + itsDay.toLocaleDateString('default', {month: 'long'});
                if(i==0){this.dCellResizeEvent.observe(dateCell);}//resize event for styling
            }
        },
        subjects: (subjects: (string | number)[][]) =>{
            subjects.forEach((subj)=>{
                var Str = this.subjBdy.appendChild(document.createElement("tr"));
                Str.id = "subj-"+subj[1];
                var Std = Str.insertCell();
                Std.setAttribute("scope", "row");
                Std.textContent = subj[0]+"";
                this.subjResizeEvent.observe(Str);
                var asgnStr = this.asgnTblBody.insertRow();
                asgnStr.id = "asgnSubj-"+subj[1];
                asgnStr.classList.add("subject");
                asgnStr.setAttribute("subj", (subj[0] as string));
            });
        },
        assignments: (assgnments: assignmentType[]) =>{
            assgnments.forEach((asgn:assignmentType) => {
                var calcEndDate = new Date(new Date(asgn.end).setDate(asgn.end.getDate()+1));
                var asgnDur = Math.ceil(Math.abs(calcEndDate.getTime() - asgn.start.getTime())/(1000*60*60*24));
                var calendarStart = new Date((document.querySelector(".dateDisplay table.table-dark thead tr th:first-child") as HTMLTableCellElement).getAttribute("title") as string);
                var asgnRSDelay = Math.ceil(Math.abs(asgn.start.getTime() - calendarStart.getTime())/(1000*60*60*24));
                var asSubj = (document.querySelector("[subj='"+ asgn.subject +"']") as HTMLElement); //add fail check if element is not found!
                var assgnment = asSubj.appendChild(document.createElement("td"));
                assgnment.id = "asgn-" + asgn.id;
                var asgnTitle = assgnment.appendChild(document.createElement("p"));
                asgnTitle.textContent = asgn.title;
                assgnment.setAttribute("start", asgn.start.toDateString());
                assgnment.setAttribute("end", asgn.end.toDateString());
                assgnment.setAttribute("title", asgn.description);
                assgnment.style.marginLeft = `calc(var(--dayWidth)*${asgnRSDelay})`;
                assgnment.style.width = `calc(var(--dayWidth)*${asgnDur})`;
                assgnment.classList.add("assignment");
                console.log(assgnment);
            });
            /* assgnments.forEach((asgn:assignmentType) => {
                var asSubj = (document.querySelector("[subj='"+ asgn.subject +"']") as HTMLElement); //add fail check if element is not found!
                var assgnment = asSubj.appendChild(document.createElement("td"));
                assgnment.id = "asgn-" + asgn.id;
                //assgnment.textContent = asgn.title;
                var asgnTitle = assgnment.appendChild(document.createElement("p"));
                asgnTitle.textContent = asgn.title;
                assgnment.setAttribute("start", asgn.start.toDateString());
                assgnment.setAttribute("end", asgn.end.toDateString());
                assgnment.setAttribute("title", asgn.description);
                var strt = document.querySelector("th[title='"+ asgn.start.toDateString() +"']");
                var nd = document.querySelector("th[title='"+ asgn.end.toDateString() +"']");
                assgnment.style.marginLeft = (strt as HTMLDivElement).offsetLeft + "px";
                assgnment.style.width = (nd as HTMLDivElement).offsetLeft - (strt as HTMLDivElement).offsetLeft + (nd as HTMLDivElement).offsetWidth + "px";
                assgnment.classList.add("assignment");
            }); */
        },
        assignments_old: (assgnments: assignmentType[]) =>{
            assgnments.forEach((asgn:assignmentType) => {
                var asSubj = (document.querySelector("[subj='"+ asgn.subject +"']") as HTMLElement); //add fail check if element is not found!
                var assgnment = asSubj.appendChild(document.createElement("td"));
                assgnment.id = "asgn-" + asgn.id;
                //assgnment.textContent = asgn.title;
                var asgnTitle = assgnment.appendChild(document.createElement("p"));
                asgnTitle.textContent = asgn.title;
                assgnment.setAttribute("start", asgn.start.toDateString());
                assgnment.setAttribute("end", asgn.end.toDateString());
                assgnment.setAttribute("title", asgn.description);
                var strt = document.querySelector("th[title='"+ asgn.start.toDateString() +"']");
                var nd = document.querySelector("th[title='"+ asgn.end.toDateString() +"']");
                assgnment.style.marginLeft = (strt as HTMLDivElement).offsetLeft + "px";
                assgnment.style.width = (nd as HTMLDivElement).offsetLeft - (strt as HTMLDivElement).offsetLeft + (nd as HTMLDivElement).offsetWidth + "px";
                assgnment.classList.add("assignment");
            });
        },
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        this.scope.style.width = `${context.mode.allocatedWidth-8}px`; // negative .5rem==8px because of scrollbar track
        this.main.style.width = `${context.mode.allocatedWidth}px`;
        this.main.style.height = `${context.mode.allocatedHeight}px`;
        this.subjToggle.style.height = `${context.mode.allocatedHeight-8-(this.properties.getBoundingClientRect().height)-(this.scope.getBoundingClientRect().height)}px`;
        /* this.subjToggle.style.lineHeight = `${context.mode.allocatedHeight-8-(this.properties.getBoundingClientRect().height)-(this.scope.getBoundingClientRect().height)}px`; */
        console.log(this.dc_props.dates.count);
        console.log(((context.mode.allocatedWidth - (document.querySelector(".subjectDisplay") as HTMLElement).getBoundingClientRect().width))/(this.dc_props.dates.count));
        document.documentElement.style.setProperty('--dayWidth', ((context.mode.allocatedWidth - (document.querySelector(".subjectDisplay") as HTMLElement).getBoundingClientRect().width))/(this.dc_props.dates.count)+'px');
        document.documentElement.style.setProperty('--subjHeight', context.mode.allocatedHeight / this.dc_props.subjects.count+'px');
        // Add code to update control view
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }
}
