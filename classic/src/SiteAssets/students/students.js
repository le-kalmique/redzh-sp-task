
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
            this.studentList = result.d.results;
            return result;
        } catch (err) {
            console.error(err);
        }
    }

    /** Add new Student Item to List
     * @param {Object} student Student Item
     */
    addStudentToList = (student) => {
        const RequestDigest = $("#__REQUESTDIGEST").val();
        const query = _spPageContextInfo.webAbsoluteUrl + "/_api/lists/getbytitle('Students')/items";  

        const objType = {
            __metadata: {
                type: 'SP.Data.StudentsListItem'
            }
        }
        const objData = JSON.stringify(Object.assign(objType, student));

        return $.ajax({
            url: query,
            type: 'POST',
            data: objData,
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': RequestDigest,
                'IF-MATCH': '*',
                'X-HTTP-Method': 'Merge'
            }
        });
    }

    /** Create card for adding new student to the list
     * @returns {JQuery.Object} card jquery object
    */
    createAddStudentCard = () => {
        const card = $('<div></div>').addClass('card').attr('id', 'newStudent');
        const addIcon = $('<h3></h3>').addClass('plus').text('+');
        card.append(addIcon);
        
        const form = $('<form></form>').addClass('form');
        const inputs = $('<div></div>').addClass('form__content');
        const nameInput = $('<input/>').addClass('form__input').attr('id', 'fname')
                    .attr('type', 'text').attr('placeholder', 'Enter name...')
                    .attr('name', 'fullname').attr('required', 'true');
        const bioInput = $('<textarea/>').addClass('form__input').attr('id', 'bio')
                    .attr('placeholder', 'Enter bio...').attr('name', 'bio');
        const submit = $('<button/>').addClass('form__submit').text('Submit');
        inputs.append(nameInput).append(bioInput);
        form.append(inputs).append(submit);

        form.on('submit', ev => {
            ev.preventDefault();
            const student = {
                fullname: $('#fname').val(),
                bio: $('#bio').val()
            };
            this.addStudentToList(student);
            console.log('nu')
            location.reload();
        })

        card.click(ev => {
            card.off('click');
            card.empty().append(form);
        })
        
        return card;
    }


    /** Render Students WebPart HTML on the webpage
     * @param result - result of a Get request for the List of Students
     */
    async renderHTML(result) {
        const studentsList = result.d.results;
        let studentsHtmlStr = "";
        const students = studentsList.map(studentItem => new StudentItem(studentItem));
        for (const item of students) {
            await item.populate();
            studentsHtmlStr += item.getHtml();
        }
        $(`#${this.studentsBodyId}`).html(studentsHtmlStr).append(this.createAddStudentCard());
    }
}

/** Class representing the Student Item */
class StudentItem {

    /** Create a Student
     * @param {Object} studentItem - Student SP List Item
     */
    constructor(studentItem) {
        this.fullName = studentItem.fullname;
        this.bio = studentItem.bio || 'Unknown';
        this.homeRegion = studentItem.homeRegion || 'Unknown';
        this.currentlyStudying = studentItem.currentlyStudying;
        this.curatorId = studentItem.curatorId;
        this.facultyId = studentItem.facultyId;
        this.subjectsIds = studentItem.selectedSubjectsId.results;
    }

    /** Extend student item with external lists' elements */
    async populate() {
        await this.setCurator(this.curatorId);
        await this.setFaculty(this.facultyId);
        await this.setSelectedSubjects(this.subjectsIds);
    } 

    /** Get Html for Student card
     * @returns {string} html string
     */
    getHtml() {
        const card = $('<div></div>').addClass('card');
        const header = $('<h3></h3>').addClass('card__header').text(this.fullName);
        const content = $('<div></div>').addClass('card__content');
        const bio = $('<p></p>').addClass('card__bio').text(this.bio);
        const info = $('<ul></ul>').addClass('card__list');
        const faculty = $('<li></li>').addClass('card__item').html('<b>Faculty</b>: ' + this.faculty);
        const homeRegion = $('<li></li>').addClass('card__item').html('<b>Region</b>: ' + this.homeRegion);
        const curator = $('<li></li>').addClass('card__item').html('<b>Curator</b>: ' + this.curator);
        const dorm = $('<li></li>').addClass('card__item').html('<b>Dorm</b>: ' + this.dorm);
        
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
            this.curator = res.d ? res.d.Title : 'Unknown';
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
            this.faculty = res.d ? res.d.shortFacultyName : 'Unknown';
            this.dorm = res.d ? res.d.assignedDormNum : 'Unknown';
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
                res.d ? subjects.push(res.d.subjectName) : {};
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
  