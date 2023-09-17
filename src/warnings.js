class Warnings {
    constructor(divName) {
        /** Warnings, in the form { message: {data: ...} } */
        this.warnings = {};
        /** Warnings element */
        this.warningsDivName = divName;
    }

    /** Tries to fetch the warnings div if it hasn't already been fetched */
    getWarningsDiv() {
        if (!this.warningsDiv) this.warningsDiv = document.getElementById(this.warningsDivName);
    }

    /** Adds a warning to the warnings list */
    add(type, data) {
        if (this.warnings[type] === undefined) this.warnings[type] = [];
        this.warnings[type].push(data);
    }

    /** Prints the warnings list to the warningsDiv */
    display() {
        if (Object.keys(this.warnings).length === 0) return;
        
        this.getWarningsDiv();
        if (!this.warningsDiv) throw `Could not find warnings div: ${this.warningsDivName}`;

        const warningContainer = document.createElement('div');
        warningContainer.hidden = false;
        const toggle = document.createElement('a');
        toggle.innerHTML = 'Hide warnings';
        toggle.addEventListener('click', function() {
            warningContainer.hidden = !warningContainer.hidden;
            toggle.innerHTML = warningContainer.hidden ? 'Show warnings' : 'Hide warnings';
        })

        // TODO: sanitize
        for (const [warning, data] of Object.entries(this.warnings)) {
            const warningP = document.createElement('p');
            warningContainer.appendChild(warningP);
            warningP.innerHTML = warning;
            const warningUl = document.createElement('ul');
            warningP.appendChild(warningUl);

            for (const datum of data) {
                const datumLi = document.createElement('li');
                warningUl.appendChild(datumLi);
                const outputArr = [];
                for (const [datumKey, datumVal] of Object.entries(datum)) {
                    outputArr.push(`${datumKey}:&nbsp;${datumVal}`);
                }
                datumLi.innerHTML = outputArr.join(' &nbsp;&nbsp;|&nbsp;&nbsp; ')
            }
        }

        this.warningsDiv.appendChild(toggle);
        this.warningsDiv.appendChild(warningContainer);
    }

    /** Clears the warnings object and the element */
    clear() {
        this.warnings = {};
        this.getWarningsDiv();
        if (this.warningsDiv) this.warningsDiv.innerHTML = '';
    }
}
