# Synopsis
**JsWiz** is a facility for building a skeleton for a wizard component
It doesn't contain any UI or dependencies

<pre>
var stubFormResult = {
        firstName: 'Ivan',
        secondName: 'Sidorov',
        email: 'ivan@sidorov.ru'
    };

    var confirmAddCheck = true;

    var addUserStep = new WizStep({
        name: 'addUserStep',
        getValues: function() {
            return stubFormResult;
        },
        onEnter: function(param) {
            confirmAddCheck = false;
        }
    });

    var confirmAddStep = new WizStep({
        name: 'confirmAddStep',
        getValues: function() {
            return {confirmed: confirmAddCheck};
        },
        beforeExit: function() {
            confirmAddCheck = true;
        }
    });

    var addUserWiz = new Wiz('addUserWiz');
    addUserWiz.addStep(addUserStep);
    addUserWiz.addStep(confirmAddStep);

    addUserWiz.start();
    confirmAddCheck --> false // onEnter first screen add user confirm check
    addUserWiz.next();
    addUserWiz.next();

    addUserWiz.getStorage() --> { // final storage
                                    firstName: "Ivan",
                                    secondName: "Sidorov",
                                    email: "ivan@sidorov.ru",
                                    confirmed: true}
</pre>

