import styled from "styled-components";
import MuiCard, {
  CardActions,
  CardContent as MuiCardContent
} from "material-ui/Card";
import Button from "material-ui/Button";
import Dialog, { DialogActions, DialogContent } from "material-ui/Dialog";

import OrderItem from "../orders/OrderHistory/OrderItem";

import { COLORS } from "../styles/constants";
import { getSymbol } from "../common/tokens";
import { fromBigNumber } from "../common/utils";

const CardContent = styled(MuiCardContent)`
  position: relative;
`;

const Card = styled(MuiCard)`
  width: 100%;
  margin-bottom: 24px;
`;

const DataPointContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const DataPoint = styled.span`
  margin-left: 16px;
`;

const Hash = styled.a`
  display: inline-block;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  //text-overflow: ellipsis;
  //max-width: 20ch;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${COLORS.gray};
`;

const UpperRight = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

// const LowerUpperRight = styled.div`
//   position: absolute;
//   top: 72px;
//   right: 16px;
// `;

export default class ClosedLoan extends React.Component {
  state = {
    showOrderDialog: false,
    order: undefined
  };

  getSingleOrder = async loanOrderHash => {
    const { bZx } = this.props;
    const order = await bZx.getSingleOrder({
      loanOrderHash
    });
    return order;
  };

  toggleOrderDialog = async event => {
    event.preventDefault();
    if (event.target.id !== ``) {
      const order = await this.getSingleOrder(event.target.id);
      this.setState(p => ({
        showOrderDialog: !p.showOrderDialog,
        order
      }));
    } else {
      this.setState(p => ({
        showOrderDialog: !p.showOrderDialog
      }));
    }
  };

  render() {
    const { tokens, bZx, accounts } = this.props;
    const {
      collateralTokenAddressFilled,
      collateralTokenAmountFilled,
      positionTokenAddressFilled,
      positionTokenAmountFilled,
      interestTokenAddress,
      interestTotalAccrued,
      interestPaidSoFar,
      loanTokenAmountFilled,
      loanTokenAddress,
      loanStartUnixTimestampSec,
      loanOrderHash,
      lender
    } = this.props.data;

    const collateralToken = tokens.filter(
      t => t.address === collateralTokenAddressFilled
    )[0];
    const collateralTokenSymbol = collateralToken.symbol;
    const loanTokenSymbol = getSymbol(tokens, loanTokenAddress);
    const interestTokenSymbol = getSymbol(tokens, interestTokenAddress);
    const positionTokenSymbol = getSymbol(tokens, positionTokenAddressFilled);

    const tradeOpened = positionTokenAddressFilled !== loanTokenAddress;

    const loanOpenedDate = new Date(loanStartUnixTimestampSec * 1000);

    return (
      <Card>
        <CardContent>
          <DataPointContainer>
            <Label>Order # </Label>
            <DataPoint title={loanOrderHash}>
              <Hash
                href="#"
                onClick={this.toggleOrderDialog}
                target="_blank"
                rel="noopener noreferrer"
                id={loanOrderHash}
              >
                {loanOrderHash}
              </Hash>
            </DataPoint>
            <Dialog
              open={this.state.showOrderDialog}
              onClose={this.toggleOrderDialog}
              // style={{width: `1000px`}}
              fullWidth
              maxWidth="md"
            >
              <DialogContent>
                <OrderItem
                  key={loanOrderHash}
                  bZx={bZx}
                  accounts={accounts}
                  tokens={tokens}
                  takenOrder={this.state.order}
                  noShadow
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.toggleOrderDialog}>OK</Button>
              </DialogActions>
            </Dialog>
          </DataPointContainer>
          <DataPointContainer>
            <Label>Lender </Label>
            <DataPoint title={lender}>
              <Hash
                href={`${bZx.etherscanURL}address/${lender}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lender}
              </Hash>
            </DataPoint>
          </DataPointContainer>

          <UpperRight>
            <Label>Loan Opened</Label>
            <div title={loanOpenedDate.toUTCString()}>
              {loanOpenedDate.toLocaleString()}
            </div>
          </UpperRight>

          <hr />

          <DataPointContainer>
            <Label>Collateral</Label>
            <DataPoint>
              {fromBigNumber(collateralTokenAmountFilled, 1e18)}
              {` `}
              {collateralTokenSymbol}
            </DataPoint>
          </DataPointContainer>

          <DataPointContainer>
            <Label>Borrowed</Label>
            <DataPoint>
              {fromBigNumber(loanTokenAmountFilled, 1e18)} {loanTokenSymbol}
            </DataPoint>
          </DataPointContainer>

          <DataPointContainer>
            <Label>Interest paid so far</Label>
            <DataPoint>
              {fromBigNumber(interestPaidSoFar, 1e18)} {interestTokenSymbol}
            </DataPoint>
          </DataPointContainer>

          <DataPointContainer>
            <Label>Interest accrued (total)</Label>
            <DataPoint>
              {fromBigNumber(interestTotalAccrued, 1e18)} {interestTokenSymbol}
            </DataPoint>
          </DataPointContainer>

          {/* <LowerUpperRight>[Collateral Options]</LowerUpperRight> */}
        </CardContent>

        <CardActions>
          <DataPointContainer style={{ marginLeft: `12px` }}>
            <Label>Active Trade</Label>
            <DataPoint>{Boolean(tradeOpened).toString()}</DataPoint>
          </DataPointContainer>

          <DataPointContainer style={{ marginLeft: `12px` }}>
            <Label>Trade Amount</Label>
            <DataPoint>
              {fromBigNumber(positionTokenAmountFilled, 1e18)}
              {` `}
              {positionTokenSymbol}
            </DataPoint>
          </DataPointContainer>
        </CardActions>
      </Card>
    );
  }
}
