import { Fragment } from "react";
import styled from "styled-components";
import Button from "material-ui/Button";
import Dialog, { DialogContent } from "material-ui/Dialog";
import { COLORS } from "../styles/constants";
import { fromBigNumber } from "../common/utils";
import { SectionLabel } from "../common/FormSection";

const DataPointContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const DataPoint = styled.span`
  margin-left: 16px;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${COLORS.gray};
`;

const TxHashLink = styled.a.attrs({
  target: `_blank`,
  rel: `noopener noreferrer`
})`
  font-family: monospace;
  display: block;
  text-overflow: ellipsis;
  overflow: auto;
}
`;

export default class ProfitOrLoss extends React.Component {
  state = {
    loading: true,
    profit: 0,
    isProfit: null,
    showDialog: false
  };

  componentDidMount = () => {
    this.getProfitOrLoss();
  };

  getProfitOrLoss = async () => {
    const { bZx, web3, loanOrderHash, accounts } = this.props;
    const txOpts = {
      from: accounts[0],
      gas: 1000000,
      gasPrice: web3.utils.toWei(`5`, `gwei`).toString()
    };
    const data = await bZx.getProfitOrLoss({
      loanOrderHash,
      trader: accounts[0],
      txOpts
    });
    this.setState({
      loading: false,
      profit: data.profitOrLoss,
      isProfit: data.isProfit
    });
  };

  withdrawProfit = async () => {
    const { bZx, accounts, web3, loanOrderHash } = this.props;
    const txOpts = {
      from: accounts[0],
      gas: 1000000,
      gasPrice: web3.utils.toWei(`5`, `gwei`).toString()
    };

    if (bZx.portalProviderName !== `MetaMask`) {
      alert(`Please confirm this transaction on your device.`);
    }

    const txObj = await bZx.withdrawProfit({
      loanOrderHash,
      getObject: true,
      txOpts
    });

    try {
      await txObj
        .estimateGas(txOpts)
        .then(gas => {
          console.log(gas);
          txOpts.gas = gas;
          txObj
            .send(txOpts)
            .once(`transactionHash`, hash => {
              alert(`Transaction submitted, transaction hash:`, {
                component: () => (
                  <TxHashLink href={`${bZx.etherscanURL}tx/${hash}`}>
                    {hash}
                  </TxHashLink>
                )
              });
            })
            .then(() => {
              alert(`Execution complete.`);
              this.closeDialog();
            })
            .catch(error => {
              console.error(error);
              alert(
                `We were not able to execute your transaction at this time.`
              );
              this.closeDialog();
            });
        })
        .catch(error => {
          console.error(error);
          alert(`The transaction is failing. Please try again later.`);
          this.closeDialog();
        });
    } catch (error) {
      console.error(error);
      alert(`The transaction is failing. Please try again later.`);
      this.closeDialog();
    }
  };

  openDialog = () => this.setState({ showDialog: true });
  closeDialog = () => this.setState({ showDialog: false });

  render() {
    const { loading, profit, isProfit, showDialog } = this.state;
    const { symbol } = this.props;
    return (
      <Fragment>
        <br />
        <DataPointContainer>
          <Label>Profit/Loss</Label>
          {loading ? (
            <DataPoint>Loading...</DataPoint>
          ) : (
            <Fragment>
              <DataPoint>
                {!isProfit && profit.toString() !== `0` && `-`}
                {fromBigNumber(profit, 1e18)}
                {` ${symbol}`}
              </DataPoint>
              {isProfit &&
                profit !== 0 && (
                  <a
                    href="#"
                    style={{ marginLeft: `12px` }}
                    onClick={e => {
                      e.preventDefault();
                      this.openDialog();
                    }}
                  >
                    withdraw
                  </a>
                )}
            </Fragment>
          )}
        </DataPointContainer>
        <Dialog open={showDialog} onClose={this.closeDialog}>
          <DialogContent>
            <SectionLabel>Withdraw Profit</SectionLabel>
            <p>
              This will withdraw {fromBigNumber(profit, 1e18)} {symbol} from
              your loan.
            </p>
            <Button
              onClick={this.withdrawProfit}
              variant="raised"
              color="primary"
            >
              I understand, withdraw profit.
            </Button>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
}
