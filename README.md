# Introduction
### Synopsis
**JsWiz** is a leightweight facility for building a skeleton for a wizard component in JavaScript
It may help you do build flexible custom wizard. It doesn't contain any UI or dependencies.

This library solves a problem of building a wizard with dynamic flow and manipulating with data
passed between screens. It doesn't depend on any js framework.

## Wizard construction
### Simple sequential wizard

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

### Usual conditional / dynamic wizard

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

### More on details
#### getValues & getNextStep
`getValues` can be a static object like `{param1: 'value1'}` but if you have a form you should return a function
like mentioned above. This function call is deferred and not executed instantly, so correct values can be taken.

`getNextStep` can be a string too but this case is more common. If your step can go only in one way, it is the proper
way to set it as a string.

*not good*
<pre>
getNextStep: function() {
    return 'confirmUserStep';
}
</pre>

*good*
<pre>
getNextStep: 'confirmUserStep'
</pre>

#### Sequential and conditional wizards `sequential: true`

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

#### How back works and what happens to storage

Back function restores the storage state:
<pre>
    ...
    var addUserStep = new WizStep({
        name: 'addUserStep',
        getValues: function() {
            return {email: 'ivan@sidorov.ru'};
        },
        getNextStep: 'confirmUserStep'
    });
    addUserStep.extend(form);

    var confirmUserStep = new WizStep({
        name: 'confirmUserStep',
        getValues: {confirmed: true},
        getNextStep: 'doneStep'
    });

    ...
    wiz.start();
    wiz.next();
    wiz.getStorage() --> {email: 'ivan@sidorov.ru'}

    wiz.next();
    wiz.getStorage() --> {email: 'ivan@sidorov.ru', confirmed: true}

    wiz.back();
    wiz.getStorage() --> {email: 'ivan@sidorov.ru'}

</pre>

### Integrating with form

JsWiz has a method `getAvailableMoves()` which returns a state of the wizard
It returns object with boolean `next, back, final` properties which can be bound
to your toolbar.

<pre>
    function updateToolbar() {
        var moves = w.getAvailableMoves();

        $('next').setStyle('display', moves.next?'block':'none');
        $('back').setStyle('display', moves.back?'block':'none');
        $('complete').setStyle('display', moves.final?'block':'none');
    };
</pre>

Wizard step object has a `addUserStep.extend` function which can be used for extending existing form object:

<pre>
    ...
    var addUserStep = new WizStep({
        name: 'addUserStep',
        getValues: function() {
            return {email: 'ivan@sidorov.ru'};
        },
        getNextStep: 'confirmUserStep'
    });
    addUserStep.extend(form);
    ...
</pre>

### Wizard and step handlers
#### Wizard
onStart
beforeStepChange
onStepChange
onComplete
TODO
#### Wizard step
onEnter
beforeExit
TODO