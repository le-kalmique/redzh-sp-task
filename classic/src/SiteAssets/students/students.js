
/** Class representing the Students WepPart */
class StudentsWP {
    constructor() {
        this.departmentsList;
        this.departmentsBodyId = "studentsBody";
        this.listTitle = "Students";
        this.endPoint = `/_api/lists/getbytitle('${this.listTitle}')/items`;
    }
    
    /** Get List of Students
     * @returns {object} sp response to the get request
    */
    async getData() {
        const query = _spPageContextInfo.webAbsoluteUrl + this.endPoint;
        const headers = {
          accept: "application/json;odata=verbose",
          "X-FORMS_BASED_AUTH_ACCEPTED": "f",
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        };

        try {
            return await $.ajax({
                url: query,
                method: "GET",
                headers: headers
            });
        } catch (err) {
            console.error(err);
        }
    }

    /** Render Students WebPart HTML on the webpage
     * @param result - result of a Get request for the List of Students
     */
    renderHTML(result) {
        /**@todo write html rendering */
    }
}

class Student {

}

SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
    const studentsWP = new StudentsWP();
    const studentsList = studentsWP.getData()
        .then(studentsList => {
        studentsWP.renderHTML(studentsList);
    })
});
  