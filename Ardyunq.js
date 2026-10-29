 document.body.innerHTML = `

 <h2>Գրանցման ձև</h2>

    <form id="form">
        Անուն՝ <input id="name" required><br><br>
        Ազգանուն՝ <input id="surname" required><br><br>
        Տարիք՝ <input id="age" type="number" min="1" max="120" required><br><br>

        Սեռ՝
        <select id="gender">
            <option>Արական</option>
            <option>Իգական</option>
        </select>

        <h3>Հետաքրքրություններ</h3>

        <label>
            <input type="checkbox" id="selectAll">
            Ընտրել բոլորը
        </label>
        <br><br>

        <label><input type="checkbox" name="hobby" value="Ծրագրավորում"> Ծրագրավորում</label><br>
        <label><input type="checkbox" name="hobby" value="Խաղեր"> Խաղեր</label><br>
        <label><input type="checkbox" name="hobby" value="Սպորտ"> Սպորտ</label><br>
        <label><input type="checkbox" name="hobby" value="Երաժշտություն"> Երաժշտություն</label><br><br>

        <p>Ընտրված հետաքրքրություններ՝ <span id="hobbyCount">0</span></p>
        <p id="hobbyMessage"></p>

        <label>
            <input type="checkbox" id="study">
            Սովորում եմ
        </label>

        <div id="studyInfo" hidden>
            <br>
            <label>
                Ուսումնական հաստատություն՝
                <input id="school" placeholder="Մուտքագրիր անունը">
            </label>
        </div>

        <br><br>

        <label>
            <input type="checkbox" id="terms" required>
            Համաձայն եմ պայմաններին
        </label>
        <br><br>

        <button type="submit">Գրանցել</button>
        <button type="reset">Մաքրել</button>
    </form>

    <p id="message"></p>

    <h3>Ընթացիկ տվյալներ</h3>
    <div id="preview"></div>

    <h3>Վերջին գրանցում</h3>
    <div id="result"></div>

    <h3>Գրանցված անձինք՝ <span id="count">0</span></h3>

    <button type="button" id="clearAll">Ջնջել բոլորը</button>
    <div id="records"></div>
`;

const form = document.getElementById("form");
const result = document.getElementById("result");
const message = document.getElementById("message");
const recordsBox = document.getElementById("records");
const count = document.getElementById("count");
const preview = document.getElementById("preview");

const selectAll = document.getElementById("selectAll");
const hobbyCount = document.getElementById("hobbyCount");
const hobbyMessage = document.getElementById("hobbyMessage");
const study = document.getElementById("study");
const studyInfo = document.getElementById("studyInfo");
const terms = document.getElementById("terms");

const hobbies = [...document.querySelectorAll(
    'input[name="hobby"]'
)];

let records = [];

try {
    records = JSON.parse(
        localStorage.getItem("registrationData") || "[]"
    );

    if (!Array.isArray(records)) records = [];
} catch {
    records = [];
}

// 1. Ընտրել բոլոր հետաքրքրությունները
selectAll.addEventListener("change", function () {
    hobbies.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });

    updateHobbies();
});

// 2. Յուրաքանչյուր checkbox-ի փոփոխության իրադարձություն
hobbies.forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        updateHobbies();
    });
});

// 3. Թարմացնել հետաքրքրությունների տվյալները
function updateHobbies() {
    const selected = hobbies.filter(
        checkbox => checkbox.checked
    );

    hobbyCount.textContent = selected.length;

    selectAll.checked =
        selected.length === hobbies.length;

    selectAll.indeterminate =
        selected.length > 0 &&
        selected.length < hobbies.length;

    if (selected.length === 0) {
        hobbyMessage.textContent =
            "Դու դեռ հետաքրքրություն չես ընտրել։";
    } else {
        hobbyMessage.textContent =
            "Ընտրել ես՝ " +
            selected.map(item => item.value).join(", ");
    }

    updatePreview();
}

// 4. Սովորելու checkbox-ի իրադարձություն
study.addEventListener("change", function () {
    studyInfo.hidden = !study.checked;

    if (!study.checked) {
        document.getElementById("school").value = "";
    }

    updatePreview();
});

// 5. Պայմանների checkbox-ի իրադարձություն
terms.addEventListener("change", function () {
    message.textContent = terms.checked
        ? "Դու համաձայնեցիր պայմաններին։"
        : "Գրանցվելու համար համաձայնվիր պայմաններին։";

    updatePreview();
});

// 6. Տվյալների փոփոխության ժամանակ թարմացնել նախադիտումը
form.addEventListener("input", updatePreview);
form.addEventListener("change", updatePreview);

function getFormData() {
    return {
        name: document.getElementById("name").value.trim(),
        surname: document.getElementById("surname").value.trim(),
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        hobbies: hobbies
            .filter(item => item.checked)
            .map(item => item.value),
        study: study.checked,
        school: document.getElementById("school").value.trim()
    };
}

// 7. Ցույց տալ տվյալները մինչև գրանցումը
function updatePreview() {
    const person = getFormData();

    preview.replaceChildren();

    const lines = [
        "Անուն՝ " + person.name,
        "Ազգանուն՝ " + person.surname,
        "Տարիք՝ " +
            (document.getElementById("age").value || ""),
        "Սեռ՝ " + person.gender,
        "Հետաքրքրություններ՝ " +
            (person.hobbies.join(", ") || "Չկան"),
        "Սովորում է՝ " + (person.study ? "Այո" : "Ոչ"),
        "Ուսումնական հաստատություն՝ " +
            (person.study ? person.school || "Նշված չէ" : "—"),
        "Պայմաններ՝ " + (terms.checked ? "Համաձայն է" : "Համաձայն չէ")
    ];

    lines.forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        preview.appendChild(p);
    });
}

// 8. Պահպանել տվյալները
function saveData() {
    try {
        localStorage.setItem(
            "registrationData",
            JSON.stringify(records)
        );
        return true;
    } catch (error) {
        message.textContent =
            "Տվյալները պահպանել չհաջողվեց։";
        return false;
    }
}

// 9. Գրանցել անձին
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const person = getFormData();

      if (!person.name || !person.surname) {
        message.textContent =
            "Լրացրու անունն ու ազգանունը։";
        return;
    }

    if (!Number.isInteger(person.age) ||
        person.age < 1 ||
        person.age > 120) {
        message.textContent =
            "Մուտքագրիր ճիշտ տարիք։";
        return;
    }

    if (person.study && !person.school) {
        message.textContent =
            "Մուտքագրիր ուսումնական հաստատության անունը։";
        document.getElementById("school").focus();
        return;
    }

    if (!terms.checked) {
        message.textContent =
            "Գրանցվելու համար համաձայնվիր պայմաններին։";
        return;
    }

    // Ավելացնել նոր գրանցումը
    person.id = Date.now();
    person.date = new Date().toLocaleString("hy-AM");

    records.push(person);

    // Պահպանել տվյալները
    if (!saveData()) {
        records.pop();
        return;
    }

    message.textContent =
        "Գրանցումը հաջողությամբ կատարվեց։";

    result.replaceChildren();

    const heading = document.createElement("h4");
    heading.textContent =
        person.name + " " + person.surname;

    result.appendChild(heading);

    const details = [
        "Տարիք՝ " + person.age,
        "Սեռ՝ " + person.gender,
        "Հետաքրքրություններ՝ " +
            (person.hobbies.join(", ") || "Չկան"),
        "Սովորում է՝ " + (person.study ? "Այո" : "Ոչ"),
        "Ուսումնական հաստատություն՝ " +
            (person.study ? person.school : "—"),
        "Գրանցման ամսաթիվ՝ " + person.date
    ];

    details.forEach(text => {
        const p = document.createElement("p");
        p.textContent = text;
        result.appendChild(p);
    });

    renderRecords();
    form.reset();
    studyInfo.hidden = true;
    updateHobbies();
    updatePreview();
});

// 10. Ցույց տալ բոլոր գրանցված անձանց
function renderRecords() {
    recordsBox.replaceChildren();
    count.textContent = records.length;

    records.forEach((person, index) => {
        const card = document.createElement("div");
        card.style.border = "1px solid #999";
        card.style.padding = "10px";
        card.style.margin = "10px 0";
        card.style.borderRadius = "8px";

        const heading = document.createElement("h4");
        heading.textContent =
            (index + 1) + ". " +
            person.name + " " + person.surname;

        const info = document.createElement("p");
        info.textContent =
            "Տարիք՝ " + person.age +
            " | Սեռ՝ " + person.gender;

        const interests = document.createElement("p");
        interests.textContent =
            "Հետաքրքրություններ՝ " +
            (person.hobbies.join(", ") || "Չկան");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Ջնջել";

        deleteButton.addEventListener("click", function () {
            const oldRecords = [...records];

            records.splice(index, 1);

            if (saveData()) {
                renderRecords();
                message.textContent =
                    "Գրանցումը ջնջվեց։";
            } else {
                records = oldRecords;
                renderRecords();
            }
        });

        card.append(heading, info, interests, deleteButton);
        recordsBox.appendChild(card);
    });
}

document.getElementById("clearAll")
    .addEventListener("click", function () {
        if (records.length === 0) {
            message.textContent =
                "Գրանցումներ չկան։";
            return;
        }

        const answer = confirm(
            "Ցանկանո՞ւմ ես ջնջել բոլոր գրանցումները։"
        );

        if (answer) {
            const oldRecords = [...records];
            records = [];

            if (saveData()) {
                renderRecords();
                result.replaceChildren();

                message.textContent =
                    "Բոլոր գրանցումները ջնջվեցին։";
            } else {
                records = oldRecords;
                renderRecords();
            }
        }
    });

// 12. Մաքրել կոճակի իրադարձություն
form.addEventListener("reset", function () {
    setTimeout(function () {
        studyInfo.hidden = true;
        message.textContent = "";
        updateHobbies();
        updatePreview();
    }, 0);
});

// 13. Էջը բացելիս բեռնել պահպանված գրանցումները
renderRecords();
updateHobbies();
updatePreview();