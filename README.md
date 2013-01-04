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

    var addUserWiz = new Wiz({name: 'addUserWiz', sequential: true});
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

## Wiz

In real world, you need to mixin wizard step into your wizard form:

<pre>
    var form = {
        getEmail:function () {
            return 'ivan@sidorov.ru'
        }
    };

    var addUserStep = new WizStep({
            name: 'addUserStep',
            getValues: function() {
                return {email: this.getEmail()};
            }
    });

    addUserStep.extend(form);

</pre>

### Sequential and conditional wizards

If you have a linear wizard you should create it like this `var wiz = new Wiz({name: 'wizName', sequential: true});`
Usually wizards are not that simple so you need to provide information about next step which can vary:

<pre>
var confirmUserStep = new WizStep({
    name: 'confirmUserStep',
    getValues: function() {
        return {confirmed: confirmed};
    },
    getNextStep: function() {
        if (confirmed) {
            return 'doneStep';
        } else {
            return 'addUserStep';
        }
    }
});
</pre>

### How back works and what happens to storage

Back function restores the storage state:
<pre>
    ...
    var addUserStep = new WizStep({
        name: 'addUserStep',
        getValues: function() {
            return {email: 'ivan@sidorov.ru'};
        },
        getNextStep: function() {
            return 'confirmUserStep';
        }
    });
    addUserStep.extend(form);

    var confirmUserStep = new WizStep({
        name: 'confirmUserStep',
        getValues: function() {
            return {confirmed: true};
        },
        getNextStep: function() {
            return 'doneStep';
        }
    });

    ...
    wiz.start();
    wiz.next();
    wiz.getStorage() --> {email: 'ivan@sidorov.ru'}

    wiz.next();
    wiz.getStorage() --> {email: 'ivan@sidorov.ru', confirmed: true}

    *wiz.back();*
    wiz.getStorage() --> {email: 'ivan@sidorov.ru'}

</pre>

