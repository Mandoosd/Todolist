// schemas/index.js

import mongoose from 'mongoose';

const connect = () => {
    mongoose
        .connect(
            'mongodb+srv://gguggu3122:rhkralswh123@cluster0.t3lcz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
            {
                dbName: 'todo_memo', // todo_memo 데이터베이스명을 사용합니다.
            }
        )
        .then(() => console.log('MongoDB 연결에 성공하였습니다.'))
        .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on('error', (err) => {
    console.error('MongoDB 연결 에러', err);
});

export default connect;
