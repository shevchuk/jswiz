/**
 * @author: Mikhail Shevchuk
 * @description: jswiz test
 */

module("sequential wizard");
testWiz();

function testWiz() {
    var checkBeforeExit = false;
    var screen1 = {
        beforeExit: function() {
            checkBeforeExit = true;
        }
    };

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

    var lastStep = new WizStep({
        name: 'lastStep',
        getValues : function() {
            return {lastStepValue: true};
        }
    });

    var addUserWiz = new Wiz({name: 'addUserWiz', sequential: true});
    addUserWiz.addStep(addUserStep);
    addUserWiz.addStep(confirmAddStep);
    addUserWiz.addStep(lastStep);

    var step1 = new WizStep({
        name:'nameEnter',
        getValues:function () {
            return {name:'hello'};
        },
        beforeExit: function() {
            checkBeforeExit = true;
        }
    });

    var step2 = new WizStep({
        name: 'emailEnter',
        getValues: function () {
            return {email:'sdi@id.com',
                email2:'kjdf@jdkfs.com',
                email3:this.getEmail()};
        }
    });

    var screen2 = {
        getEmail:function () {
            return 'nwe@k.cc'
        }
    };

    step2.extend(screen2);

    var email2AsInput = '';
    var screen3 = {
        getEmail2 : function(p) {
            email2AsInput = p.email2;
            return p.email2;
        }
    };

    var step3 = new WizStep({
        name: 'confirm',
        getValues: function () {
            return {confirmed: true}
        },
        onEnter: screen3.getEmail2
    });

    step3.extend(screen3);

    var step4 = new WizStep({
        name: 'noout',
        getValues: function() {
            return {}
        }
    });

    var w = new Wiz({name: 'addUser', sequential: true});

    w.addStep(step1);
    w.addStep(screen2);
    w.addStep(screen3);
    w.addStep(step4);
    w.start();

    test("Test", function () {
        equal(0, w._currentStepNumber, 'initial step');
        equal(false, checkBeforeExit, 'initial check before exit value');
        deepEqual({}, w.getStorage(), 'Empty initial storage');
        w.next();
        equal(true, checkBeforeExit, 'check before exit value');
        deepEqual({name: 'hello'}, w.getStorage(), 'Checked storage value')
        notEqual('kjdf@jdkfs.com', email2AsInput, 'Check that there is no email2 yet');
        w.next();
        equal('kjdf@jdkfs.com', email2AsInput, 'Check email2 as input');
        deepEqual(w.getStorage(), {name: 'hello',
                   email:'sdi@id.com',
                   email2:'kjdf@jdkfs.com',
                   email3:'nwe@k.cc'}, 'Checked storage value')

        equal(2, w._currentStepNumber, 'check step number');
        w.next();
        deepEqual(w.getStorage(), {name: 'hello',
            email:'sdi@id.com',
            email2:'kjdf@jdkfs.com',
            email3:'nwe@k.cc',
            confirmed: true}, 'Checked final storage value')

        equal(4, w.wizSteps.length, 'wiz steps number');

        notEqual("function", typeof w.wizSteps[0].onEnter, 'check onEnter function absence');
        notEqual("function", typeof w.wizSteps[1].onEnter, 'check onEnter function absence');
        equal("function", typeof w.wizSteps[2].onEnter, 'check onEnter function presence');


        equal(confirmAddCheck, true, 'initial add user confirm check');
        addUserWiz.start();
        equal(addUserWiz.getCurrentStep().stepName, 'addUserStep', 'check initial name');
        equal(confirmAddCheck, false, 'onEnter first screen add user confirm check');
        addUserWiz.next();
        equal(addUserWiz.getCurrentStep().stepName, 'confirmAddStep', 'check step name after next');
        addUserWiz.next();
        addUserWiz.next();

        addUserWiz.next();
        addUserWiz.next();
        addUserWiz.next(); /// next more than needed;

        equal(confirmAddCheck, true, 'final add user confirm check');

        deepEqual(addUserWiz.getStorage(), {
            firstName: "Ivan",
            secondName: "Sidorov",
            email: "ivan@sidorov.ru",
            lastStepValue: true,
            confirmed: true}, 'Check add user info');

        addUserWiz.back();

        deepEqual(addUserWiz.getStorage(), {
            confirmed: true,
            firstName: "Ivan",
            secondName: "Sidorov",
            email: "ivan@sidorov.ru"}, 'Check storage after back');

        addUserWiz.back();


        addUserWiz.back();

        equal(addUserWiz.getCurrentStep().stepName, 'addUserStep', 'check step name after back');




    });

    return w;
}
