class CPromise {
    constructor(executor) {
        if (typeof executor !== 'function') {
            throw new Error('Executor must be a function');
          }
        
          // Internal state. `$state` is the state of the promise, and `$chained` is
          // an array of the functions we need to call once this promise is settled.
          this.$state = 'PENDING';
          this.$chained = [];
        
          const resolve = res => {
            // A promise is considered "settled" when it is no longer
            // pending, that is, when either `resolve()` or `reject()`
            // was called once. 
            if (this.$state !== 'PENDING') {
              return;
            }
           
            this.$state = 'FULFILLED';
            this.$internalValue = res;
            // If  `.then()` is called while this promise was pending, need
            // to call their `onFulfilled()` function
            for (const { onFulfilled } of this.$chained) {
              onFulfilled(res);
            }
          };
          const reject = err => {
            if (this.$state !== 'PENDING') {
              return;
            }
            this.$state = 'REJECTED';
            this.$internalValue = err;
            for (const { onRejected } of this.$chained) {
              onRejected(err);
            }
          };
        
          // Call the executor function with `resolve()` and `reject()`.
          try {
            // If the executor function throws a sync exception, we consider that
            // a rejection. 
            executor(resolve, reject);
          } catch (err) {
            reject(err);
          }
    }

    then(onFulfilled, onRejected) {
        return new CPromise((resolve, reject) => {
            // Ensure that errors in `onFulfilled()` and `onRejected()` reject the
            // returned promise, to prevent crashing the process. 
            const _onFulfilled = res => {
              try {
                // If `onFulfilled()` returns a promise, trust `resolve()` to handle
                // it correctly.
                resolve(onFulfilled(res));
              } catch (err) {
                reject(err);
              }
            };
            const _onRejected = err => {
              try {
                reject(onRejected(err));
              } catch (_err) {
                reject(_err);
              }
            };
            if (this.$state === 'FULFILLED') {
              _onFulfilled(this.$internalValue);
            } else if (this.$state === 'REJECTED') {
              _onRejected(this.$internalValue);
            } else {
              this.$chained.push({ onFulfilled: _onFulfilled, onRejected: _onRejected });
            }
          });
    }

    public static function test_promise_1(){
        return new CPromise(function(resolve,reject){
            console.log('123')
            setTimeout(() => {console.log("promise 1 resolved"); res(1);}, 2000)
        })
    }

    test_promise_1()
    
}



