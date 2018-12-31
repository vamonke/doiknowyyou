import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'elemental';

import EditName from './EditName';

export default function PlayersCard(props) {
  const { players, viewer } = props;
  return (
    <div className="card">
      <Table className="reduceTop">
        <colgroup>
          <col width="" />
          <col width="100" />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const playerName = player._id === viewer._id
              ? <EditName viewer={viewer} />
              : player.name;
            return (
              <tr key={player._id}>
                <td>{playerName}</td>
                <td>
                  {player.isReady
                    ? <div className="ready">Ready</div>
                    : 'Not ready'
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

PlayersCard.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
    }),
  ),
  viewer: PropTypes.shape({
    _id: PropTypes.string,
    isReady: PropTypes.bool,
  }),
};

PlayersCard.defaultProps = {
  players: [],
  viewer: {
    isReady: false,
  },
};
