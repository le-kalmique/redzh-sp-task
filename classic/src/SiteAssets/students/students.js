
/** Class representing the Students WebPart */
class StudentsWP {
    constructor() {
        this.studentList;
        this.studentsBodyId = "studentsBody";
        this.listTitle = "Students";
        this.endPoint = `/_api/lists/getbytitle('${this.listTitle}')/items`;
    }
    
    /** Get List of Students
     * @returns {Object} sp response to the get request
    */
    async getData() {
        const query = _spPageContextInfo.webAbsoluteUrl + this.endPoint;
        const headers = {
          accept: "application/json;odata=verbose",
          "X-FORMS_BASED_AUTH_ACCEPTED": "f",
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        };
        try {
            const request = await fetch(query, {headers});
            const result = await request.json();
            return result;
        } catch (err) {
            console.error(err);
        }
    }

    /** Render Students WebPart HTML on the webpage
     * @param result - result of a Get request for the List of Students
     */
    async renderHTML(result) {
        const studentsList = result.d.results;
        let studentsHtmlStr = "";
        const students = studentsList.map(studentItem => new StudentItem(studentItem));
        for (const item of students) {
            console.log('what')
            await item.populate();
            console.log('the')
            studentsHtmlStr += item.getHtml();
        }
        $(`#${this.studentsBodyId}`).html(studentsHtmlStr);
    }
}

/** Class representing the Student Item */
class StudentItem {

    /** Create a Student
     * @param {Object} studentItem - Student SP List Item
     */
    constructor(studentItem) {
        this.fullName = studentItem.fullname;
        this.bio = studentItem.bio;
        this.homeRegion = studentItem.homeRegion;
        this.currentlyStudying = studentItem.currentlyStudying;
        this.curatorId = studentItem.curatorId;
        this.facultyId = studentItem.facultyId;
        this.subjectsIds = studentItem.selectedSubjectsId.results;
    }

    async populate() {
        console.log('here')
        await this.setCurator(this.curatorId);
        await this.setFaculty(this.facultyId);
        await this.setSelectedSubjects(this.subjectsIds);
        console.log('help me')
    } 

    getHtml() {
        const card = $('<div></div>').addClass('card');
        const header = $('<h3></h3>').addClass('card__header').text(this.fullName);
        const content = $('<div></div>').addClass('card__content');
        const bio = $('<p></p>').addClass('card__bio').text(this.bio);
        // const info = $('<div></div>').addClass('card__info');
        const info = $('<ul></ul>').addClass('card__list');
        const faculty = $('<li></li>').addClass('card__item').text('Faculty: ' + this.faculty);
        const homeRegion = $('<li></li>').addClass('card__item').text('Region: ' + this.homeRegion);
        const curator = $('<li></li>').addClass('card__item').text('Curator: ' + this.curator);
        const dorm = $('<li></li>').addClass('card__item').text('Dorm: ' + this.dorm);
        
        info.append(faculty).append(homeRegion).append(dorm).append(curator);
        content.append(bio).append(info);
        card.append(header).append(content);

        return $('<div></div>').append(card).html();
    }


    /** Get Curator Title from Users
     * @param {number} id curator User Id
     * @returns {string} curator full name
     */
    async setCurator(id) {
        const query = _spPageContextInfo.webAbsoluteUrl + `/_api/web/GetUserById(${id})`
        try {
            const req = await fetch(query, {headers: { Accept: "application/json;odata=verbose"}})
            const res = await req.json();
            this.curator = res.d.Title;
        }
        catch (err) {
            console.error(err);
        }
    }

    /** Get Faculty Object 
     * @param {number} id faculty Item Id
     * @returns {{facultyName: string, assignedDorm: number}} Faculty Object
    */
    async setFaculty(id) {
        const query = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getByTitle('Faculties')/items(${id})`;
        try {
            const req = await fetch(query, {headers: { Accept: "application/json;odata=verbose"}})
            const res = await req.json();
            this.faculty = res.d.shortFacultyName;
            this.dorm = res.d.assignedDormNum;
        } 
        catch(err) {
            console.error(err);
        }
    }

    /** Get Selected Subjects 
     * @param {Array.<number>} ids array of selected subjects' Item Ids
     * @returns {Array.<string>} array of selected subjects' names    
    */
    async setSelectedSubjects(ids) {
        const subjects = [];
        for (const id of ids) {
            const query = _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getByTitle('Selective Subjects')/items(${id})`;
            try {
                const req = await fetch(query, {headers: { Accept: "application/json;odata=verbose"}})
                const res = await req.json();
                subjects.push(res.d.subjectName);
            }
            catch (err) {
                console.error(err);
            }
        }
        this.selectedSubjects = subjects;
    }
}

SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
    const studentsWP = new StudentsWP();
    const studentsList = studentsWP.getData()
        .then(studentsList => {
        studentsWP.renderHTML(studentsList);
    })
});
  