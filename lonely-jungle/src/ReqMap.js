import { reactive, ref } from 'vue'
import * as shared from 'Shared/SharedUtils.js'

// Helper func for Promises
export function makePromiseObj(opts) {
  opts = shared.valOr(opts, {});
  let promiseObj = {
  };
  promiseObj.promise = new Promise((resolve, reject) => {
    promiseObj.resolve = resolve;
    promiseObj.reject = reject;
  });
  if ('timeout' in opts) {
    setTimeout(() => {
      // Note: this is a no-op if the promise is already resolved
      promiseObj.reject(new Error(`Timed out after ${opts.timeout}ms`));
    }, opts.timeout);
  }
  promiseObj.wait = async () => {
    return await promiseObj.promise;
  }
  return promiseObj;
}

/*
Helper for creating a request/response map over an arbitrary channel.
*/
export class ReqMap {
  constructor() {
    this.pendingReqs = {}
  }

  async waitResponse(reqId, opts) {
    opts = shared.valOr(opts, {});
    let reqPromise = new Promise((resolve, reject) => {
      if (reqId in this.pendingReqs) {
        throw new Error("Cannot reuse request id: " + reqId);
      }
      this.pendingReqs[reqId] = {
        resolve: resolve,
        reject: reject,
        user: shared.valOr(opts.user, null),
      };
      setTimeout(() => {
        let reqPromise = this.pendingReqs[reqId];
        if (reqPromise) {
          delete this.pendingReqs[reqId];
          reqPromise.reject(new Error(`Request id ${reqId} timed out.`));
        }
      }, shared.valOr(opts.timeout, 10*1000))
    })
    return reqPromise;
  }

  registerResponse(reqId, res) {
    if (!(reqId in this.pendingReqs)) {
      console.warn(`No request found with id ${reqId}`);
      return;
    }
    let reqPromise = this.pendingReqs[reqId];
    delete this.pendingReqs[reqId];
    reqPromise.resolve(res);
  }
}

