import { TransactionModalBasePo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsTransactionModalPo extends TransactionModalBasePo {
  private static readonly TID = "sns-transaction-modal-component";

  static under(element: PageObjectElement): SnsTransactionModalPo {
    return new SnsTransactionModalPo(
      element.byTestId(SnsTransactionModalPo.TID)
    );
  }
}
