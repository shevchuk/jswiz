module("conditional wizard");

var wiz = new Wiz({name: 'condWizard'});

var form = {
    getEmail:function () {
        return 'ivan@sidorov.ru'
    }
};

var addUserStep = new WizStep({
    name: 'addUserStep',
    getValues: function() {
        return {email: this.getEmail()};
    },
    getNextStep: function() {
        return 'confirmUserStep';
    }
});
addUserStep.extend(form);

var confirmed = true;
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

var doneStep = new WizStep({
    name: 'doneStep',
    getValues: function() {

    },
    getNextStep: function() {

    }
});

wiz.addStep(form);
wiz.addStep(doneStep);
wiz.addStep(confirmUserStep);
wiz.start();


test("Conditional wizard test", function () {
    wiz.start();
    equal(wiz.getCurrentStep().stepName, 'addUserStep', 'check initial step name');
    wiz.next();
    equal(wiz.getCurrentStep().stepName, 'confirmUserStep', 'check confirm step name');
    wiz.next();

    equal(wiz.getStepByName('addUserStep').stepName, 'addUserStep', 'getStepByName check');
});

test("Back test", function() {
    wiz.start();
    equal(wiz.getCurrentStep().stepName, 'addUserStep', 'Check initial step');

    wiz.next();
    equal(wiz.getCurrentStep().stepName, 'confirmUserStep', 'check confirm step name');

    wiz.back();
    equal(wiz.getCurrentStep().stepName, 'addUserStep', 'Check that back function works');

    wiz.next();
    deepEqual({email: 'ivan@sidorov.ru'}, wiz.getStorage(), 'Check that storage is reverted when back button is hit 1');

    wiz.next();
    deepEqual({email: 'ivan@sidorov.ru', confirmed: true}, wiz.getStorage(), 'Check that storage is filled after it is reverted');

    wiz.back();
    deepEqual({email: 'ivan@sidorov.ru'}, wiz.getStorage(), 'Check that storage is reverted when back button is hit 2');
    wiz.back();
    equal(wiz.getCurrentStep().stepName, 'addUserStep', 'Check that few back functions works');

    wiz.next();
    equal(wiz.getCurrentStep().stepName, 'confirmUserStep', 'Check next after several back');
});

test("Throws test", function () {
    throws(function() {
            new WizStep({});
        },
        /name is mandatory, should be unique/,
        'raised error message about mandatory step name'
    );

    throws(function() {
            new WizStep({name: 'wizStep'});
        },
        /getValues is mandatory, should be/,
        'raised error message about mandatory getValues'
    );

    throws(function() {
            var w = new Wiz();

            w.start();
        },
        /no steps defined in this wizard/,
        'raised error message about no steps in wizard'
    );

    throws(function() {
            var w = new Wiz();
            w.addStep(new WizStep({
                name: 'wizStep',
                getValues: function() {}
            }));
            w.start();
        },
        /getNextStep/,
        'raised error message about no getNextStep'
    );
});
