window.addEvent('domready', function(){
    Element.implement({
        show: function(e) {
            this.setStyle('display', 'block');
        },
        hide: function(e) {
            this.setStyle('display', 'none');
        }
    });

    var addUser = $('addUser');
    var confirmUser = $('confirmUser');
    var congrats = $('congrats');
    var completedScreen = $('completedScreen');

    /**
     * Wizard creation
     */
    var w = new Wiz({
        name: 'wiz',
        beforeStepChange: function() {
            hideAll();
            updateToolbar();
        },
        onComplete: function() {
            var self = this;

            congrats.hide();
            $('toolbar').hide();

            completedScreen.show();

            var s = w.getStorage();
            $('result').set('html',
                '<p>First name: ' + s.firstName + '</p>' +
                '<p>Second name: ' + s.secondName + '</p>'
            );

            window.console && console.log(w.getStorage());

            if (w.getStorage().addAnother) {
                self.start();
            }

            $('startOver').addEvent('click', function() {
                self.start();
            });
        },
        onStart: function() {
            $('result').empty();

            $('toolbar').show();
            completedScreen.hide();
        }
    });

    /**
     * Adding 3 steps
     */
    var addUserStep = new WizStep({
        name: 'addUserStep',
        getValues: function() {
            return {
                firstName: $('firstName').value,
                secondName: $('secondName').value
            }
        },
        onEnter: function(p) {
            addUser.show();
            updateToolbar();
        },
        getNextStep: function() {
            return 'confirmUser';
        }
    });

    var confirmUserStep = new WizStep({
        name: 'confirmUser',
        getValues: function () {
            return {
                confirm: $('confirm').checked
            }
        },
        onEnter: function(p) {
            confirmUser.show();
        },
        getNextStep: 'congrats'
    });

    var congratsStep = new WizStep({
        name: 'congrats',
        getValues: function() {
            return {
                addAnother: $('addAnother').checked
            }
        },
        onEnter: function(p) {
            congrats.show();
        },
        final: true
    });

    // adding these steps
    w.addStep(addUserStep);
    w.addStep(confirmUserStep);
    w.addStep(congratsStep);


    /*
     * Navigation toolbar
     */
    $('next').onclick = function () {
        w.next();
    }

    $('back').onclick = function () {
        w.back();
    }

    $('complete').onclick = function () {
        w.next();
    }

    function updateToolbar() {
        var moves = w.getAvailableMoves();

        $('next').setStyle('display', moves.next?'block':'none');
        $('back').setStyle('display', moves.back?'block':'none');
        $('complete').setStyle('display', moves.final?'block':'none');
    };



    function hideAll() {
        addUser.hide();
        confirmUser.hide();
        congrats.hide();
    };

    // hide all screen
    hideAll();

    // start wizard
    w.start();
});