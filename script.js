// CARECONNECT - APPOINTMENT MANAGEMENT

const STORAGE_KEY = "careconnectAppointments";

// Get saved appointments from the browser
function getAppointments() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

// Save appointments in the browser
function saveAppointments(appointments) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appointments)
    );
}

// Set the earliest selectable appointment date to today
function setMinimumDate() {
    const dateInput = document.getElementById("appointmentDate");

    if (dateInput) {
        const today = new Date();
        const localDate = new Date(
            today.getTime() - today.getTimezoneOffset() * 60000
        ).toISOString().split("T")[0];

        dateInput.min = localDate;
    }
}

// Handle the appointment form
function setupAppointmentForm() {
    const form = document.getElementById("appointmentForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const patientName =
            document.getElementById("patientName").value.trim();

        const patientAge =
            Number(document.getElementById("patientAge").value);

        const patientEmail =
            document.getElementById("patientEmail").value.trim();

        const doctor =
            document.getElementById("doctor").value;

        const appointmentDate =
            document.getElementById("appointmentDate").value;

        const appointmentTime =
            document.getElementById("appointmentTime").value;

        const reason =
            document.getElementById("reason").value.trim();

        const message = document.getElementById("formMessage");

        if (!patientName || !patientEmail || !doctor ||
            !appointmentDate || !appointmentTime) {
            message.textContent = "Please fill in all required fields.";
            message.style.color = "red";
            return;
        }

        if (patientAge < 1 || patientAge > 120) {
            message.textContent = "Please enter a valid age.";
            message.style.color = "red";
            return;
        }

        const today = new Date();
        const localToday = new Date(
            today.getTime() - today.getTimezoneOffset() * 60000
        ).toISOString().split("T")[0];

        if (appointmentDate < localToday) {
            message.textContent = "Please select today or a future date.";
            message.style.color = "red";
            return;
        }

        const appointments = getAppointments();

        const appointment = {
            id: Date.now().toString(),
            patientName: patientName,
            patientAge: patientAge,
            patientEmail: patientEmail,
            doctor: doctor,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            reason: reason,
            status: "Requested"
        };

        appointments.push(appointment);
        saveAppointments(appointments);

        message.textContent =
            "Appointment request saved successfully!";

        message.style.color = "green";

        form.reset();
        setMinimumDate();
    });
}

// Display saved appointments on the status page
function displayAppointments() {
    const list = document.getElementById("appointmentList");

    if (!list) return;

    const appointments = getAppointments();

    list.replaceChildren();

    if (appointments.length === 0) {
        const card = document.createElement("div");
        card.className = "service-card";

        const heading = document.createElement("h3");
        heading.textContent = "No appointments yet";

        const message = document.createElement("p");
        message.textContent =
            "Your appointment requests will appear here after booking.";

        card.append(heading, message);
        list.appendChild(card);
        return;
    }

    appointments.slice().reverse().forEach(function (appointment) {
        const card = document.createElement("div");
        card.className = "service-card";
        card.style.marginBottom = "20px";

        const heading = document.createElement("h3");
        heading.textContent = appointment.patientName;

        const details = document.createElement("p");
        details.textContent =
            "Doctor: " + appointment.doctor +
            " | Date: " + appointment.appointmentDate +
            " | Time: " + appointment.appointmentTime;

        const age = document.createElement("p");
        age.textContent = "Patient age: " + appointment.patientAge;

        const status = document.createElement("p");
        status.textContent = "Status: " + appointment.status;
        status.style.fontWeight = "bold";
        status.style.color =
            appointment.status === "Cancelled" ? "#b42318" : "#087f8c";

        card.append(heading, details, age, status);

        if (appointment.reason) {
            const reason = document.createElement("p");
            reason.textContent = "Reason: " + appointment.reason;
            card.appendChild(reason);
        }

        if (appointment.status !== "Cancelled") {
            const cancelButton = document.createElement("button");

            cancelButton.type = "button";
            cancelButton.textContent = "Cancel Appointment";
            cancelButton.className = "btn";
            cancelButton.style.backgroundColor = "#b42318";
            cancelButton.style.color = "white";
            cancelButton.style.border = "none";
            cancelButton.style.cursor = "pointer";
            cancelButton.style.marginTop = "12px";

            cancelButton.addEventListener("click", function () {
                const confirmed = confirm(
                    "Are you sure you want to cancel this appointment?"
                );

                if (!confirmed) return;

                const updatedAppointments = getAppointments().map(
                    function (item) {
                        if (item.id === appointment.id) {
                            return {
                                ...item,
                                status: "Cancelled"
                            };
                        }

                        return item;
                    }
                );

                saveAppointments(updatedAppointments);
                displayAppointments();
            });

            card.appendChild(cancelButton);
        }

        list.appendChild(card);
    });
}

// Run the correct features on each page
document.addEventListener("DOMContentLoaded", function () {
    setMinimumDate();
    setupAppointmentForm();
    displayAppointments();
});