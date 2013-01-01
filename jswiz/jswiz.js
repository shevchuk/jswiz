/**
 * Created with JetBrains WebStorm.
 * User: mico
 * Date: 31.12.12
 * Time: 21:45
 * To change this template use File | Settings | File Templates.
 */

function Wiz(name)
{
    this.wizName = name;
    this.wizSteps = [];
    this.wizStorage = {};

    this._currentStep = 0;
}

Wiz.prototype.toString = function ()
{
    var res = 'Name: ' + this.wizName + '\n';
    res += 'Steps: \n';
    for (var i=0; i<this.wizSteps.length; i++)
    {
        res += i + ' step: ' + this.wizSteps[i].wizName + '\n';
    }
    return res;
};

Wiz.prototype.getStorage = function()
{
    return this.wizStorage;
};

Wiz.prototype.addStep = function(step)
{
    this.wizSteps.push(step);
};

Wiz.prototype.next = function()
{
    // out of steps
    if (this._currentStep == this.wizSteps.length-1) return;

    // store current step
    var prevStep = this.wizSteps[this._currentStep];

    // go to next step
    this._currentStep ++;
    var nextStep = this.wizSteps[this._currentStep];

    // save result into storage
    mixin(prevStep.out(), this.wizStorage);

    function mixin(src, dst) {
        for (var k in src) {
            if (src.hasOwnProperty(k)) {
                dst[k] = src[k];
            }
        }
        return dst;
    };

    // pass result to the next step
    prevStep.beforeExit && prevStep.beforeExit;

    nextStep.in(prevStep.out());

    return this.wizSteps[this._currentStep];
};

Wiz.prototype.mixin = function(destination) {
    for (var k in this) {
        destination[k] = this[k];
    }
    return destination;
};


function WizStep(name, onEnter, beforeExit)
{
    this.wizName = name || 'Unnamed';
    this.onEnter = onEnter;
    this.beforeExit = beforeExit;

    this.input = null;
}

WizStep.prototype.toString = function()
{
    return 'Step: ' + this.wizName;
};

WizStep.prototype.in = function(param)
{
    this.input = param;
    console.log(this.toString() + '\n' + this.input);

    // call onEnter hook
    this.onEnter && this.onEnter();
};

WizStep.prototype.out = function()
{
    // to override
};

WizStep.prototype.mixin = function(destination) {
    for (var k in this) {
        destination[k] = this[k];
    }
    return destination;
};


function mockWiz()
{
    var step1 = new WizStep('enter name');

    step1.out = function()
    {
        return {name: 'hello'};
    };

    var step2 = new WizStep('emailEnter');

    var screen2 = {
      getEmail: function () {return 'nwe@k.cc'}
    };

    step2.mixin(screen2);

    screen2.out = function()
    {
        return {email: 'sdi@id.com',
                email2: 'kjdf@jdkfs.com',
                email3: this.getEmail()};
    };

    var step3 = new WizStep('confirm');

    var w = new Wiz('addUser');
    w.addStep(step1);
    w.addStep(screen2);
    w.addStep(step3);
    return w;
}

var addUser = new Wiz('addUser');