import { Box } from '@mui/material';
import SquareIcon from '@mui/icons-material/Square';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { useEffect, useState } from 'react';
import OptionButtons from './OptionButtons';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  randomizeBombs,
  getUncoveredBoard,
  returnFieldValue,
  checkFieldIndex,
} from './mechanicsFuntions';
import * as _ from 'lodash';
import BombCounter from './BombCounter';
import GameResult from './GameResult';
import { BsEmojiSmile } from 'react-icons/bs';
import { HiOutlineEmojiSad } from 'react-icons/hi';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import { fadeIn } from 'react-animations';
import Radium, { StyleRoot } from 'radium';

function Game({ difficultyLevel }) {
  const styles = {
    fadeIn: {
      animation: 'x 2s',
      animationName: Radium.keyframes(fadeIn, 'fadeIn'),
    },
  };

  const getBoard = (fieldsNumber) => {
    return Array.from(Array(fieldsNumber), (_) => []).map((_, firstIndex) => {
      return Array.from(Array(fieldsNumber), (_, secondIndex) => (
        <SquareIcon
          key={[firstIndex, secondIndex]}
          fontSize='large'
          color='primary'
          onClick={() => {
            uncoverEmptyFields(
              [firstIndex, secondIndex],
              getUncoveredBoard(board.bombs, difficultyLevel.fields)
            );
          }}
        />
      ));
    });
  };

  const [board, setBoard] = useState({
    board: getBoard(difficultyLevel.fields),
    option: 'Empty field',
    bombs: randomizeBombs(difficultyLevel.fields, difficultyLevel.bombs),
    uncoveredBoard: [],
  });

  const [win, setWin] = useState(null);
  const [foundBombs, setFoundBombs] = useState(0);
  const { width, height } = useWindowSize();

  useEffect(() => {
    setBoard((currentBoard) => {
      return {
        ...currentBoard,
        uncoveredBoard: getUncoveredBoard(
          currentBoard.bombs,
          difficultyLevel.fields
        ),
      };
    });
  }, [board.bombs]);

  const makeMove = (indexes) => {
    setBoard((currentBoard) => {
      if (
        currentBoard.option === 'Empty field' &&
        currentBoard.uncoveredBoard[indexes[0]][indexes[1]] === 'x'
      )
        setWin(false);
      if (
        currentBoard.option === 'Bomb' &&
        currentBoard.uncoveredBoard[indexes[0]][indexes[1]] === 'x'
      )
        setFoundBombs((bombs) => bombs + 1);
      return {
        ...currentBoard,
        board: currentBoard.board.map((row, index) => {
          if (indexes[0] === index)
            return row.map((field, fieldIndex) => {
              if (fieldIndex === indexes[1]) {
                if (currentBoard.option === 'Bomb')
                  return (
                    <SportsScoreIcon
                      fontSize='large'
                      color='primary'
                      key={[index, fieldIndex]}
                      onClick={() =>
                        uncoverEmptyFields(
                          indexes,
                          getUncoveredBoard(board.bombs, difficultyLevel.fields)
                        )
                      }
                    />
                  );
                if (currentBoard.option === 'Question mark')
                  return (
                    <QuestionMarkIcon
                      fontSize='large'
                      color='primary'
                      key={[index, fieldIndex]}
                      onClick={() =>
                        uncoverEmptyFields(
                          indexes,
                          getUncoveredBoard(board.bombs, difficultyLevel.fields)
                        )
                      }
                    />
                  );
                else
                  return returnFieldValue(currentBoard.uncoveredBoard, indexes);
              } else return field;
            });
          else return row;
        }),
      };
    });
  };

  const uncoverEmptyFields = (fieldNumbers, uncoveredBoard) => {
    const [i, j] = fieldNumbers;
    const length = uncoveredBoard.length;
    if (uncoveredBoard[i][j] === 'f') return;
    makeMove(fieldNumbers);
    const newUncoveredBoard = uncoveredBoard.map((row, firstIndex) => {
      if (firstIndex === i)
        return row.map((field, secondIndex) => {
          if (secondIndex === j) return 'f';
          else return field;
        });
      else return row;
    });
    if (uncoveredBoard[i][j] === 0) {
      if (checkFieldIndex(i + 1, j, length))
        uncoverEmptyFields([i + 1, j], newUncoveredBoard);
      if (checkFieldIndex(i - 1, j, length))
        uncoverEmptyFields([i - 1, j], newUncoveredBoard);
      if (checkFieldIndex(i, j + 1, length))
        uncoverEmptyFields([i, j + 1], newUncoveredBoard);
      if (checkFieldIndex(i, j - 1, length))
        uncoverEmptyFields([i, j - 1], newUncoveredBoard);
      if (checkFieldIndex(i + 1, j + 1, length))
        uncoverEmptyFields([i + 1, j + 1], newUncoveredBoard);
      if (checkFieldIndex(i - 1, j - 1, length))
        uncoverEmptyFields([i - 1, j - 1], newUncoveredBoard);
      if (checkFieldIndex(i + 1, j - 1, length))
        uncoverEmptyFields([i + 1, j - 1], newUncoveredBoard);
      if (checkFieldIndex(i - 1, j + 1, length))
        uncoverEmptyFields([i - 1, j + 1], newUncoveredBoard);
    }
    return;
  };

  return (
    <StyleRoot>
      <div
        style={{
          display: 'flex',
          marginTop: '50px',
          justifyContent: 'center',
        }}
      >
        <Box>
          <OptionButtons setBoard={setBoard} board={board} />
          {win !== null ? <GameResult result={win} /> : ''}
        </Box>
        <Box
          sx={{
            maxWidth: '100%',
            marginLeft: '10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {win === null ? (
            board.board.map((el, index) => (
              <div key={index} style={styles.fadeIn}>
                {' '}
                {el}{' '}
              </div>
            ))
          ) : win === true ? (
            <div>
              <Confetti width={width} height={height} />
              <BsEmojiSmile
                style={{
                  width: '300px',
                  height: '300px',
                  color: 'rgb(25, 118, 210)',
                }}
              />
            </div>
          ) : (
            <HiOutlineEmojiSad
              style={{
                width: '300px',
                height: '300px',
                color: 'rgb(25, 118, 210)',
              }}
            />
          )}
          <BombCounter
            board={board.uncoveredBoard}
            foundBombs={foundBombs}
            setWin={setWin}
          />
        </Box>
      </div>
    </StyleRoot>
  );
}

export default Game;
