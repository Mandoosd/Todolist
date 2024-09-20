import express from 'express';
import Joi from 'joi';
import Todo from '../schemas/todo.schemas.js';

const router = express.Router();

// 할 일 생성 API의 요청 데이터 검증을 위한 Joi 스키마를 정의합니다.
const createTodoSchema = Joi.object({
    value: Joi.string().min(1).max(50).required(),
});

// 할일 등록 API

router.post('/todos', async (req, res, next) => {
    try {
        // const { value } = req.body;

        // 클라이언트에게 전달받은 데이터를 검증합니다.
        const validation = await createTodoSchema.validateAsync(req.body);

        // 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
        const { value } = validation;

        // 만약 클라이언트가 value 데이터를 전달하지 못했을때, 에러메세지를 띄운다.
        if (!value) {
            return res
                .status(400)
                .json({ errorMessage: '{value}  데이터가 존재하지 않습니다.' });
        }

        // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
        const todoMaxOrder = await Todo.findOne().sort('-order').exec();

        // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
        const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

        // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.
        const todo = new Todo({ value, order });

        // 생성한 '해야할 일'을 MongoDB에 저장합니다.
        await todo.save();

        return res.status(201).json({ todo: todo });
    } catch (error) {
        next(error);
    }
});

// 해야할일 목록 조회 API

router.get('/todos', async (req, res, next) => {
    const todos = await Todo.find().sort('-order').exec();

    return res.status(200).json({ todos });
});

// 해야할 일 순서 변경 , 완료/해제 , 내용변경 API
router.patch('/todos/:todoId', async (req, res, next) => {
    const { todoId } = req.params;
    const { order, done, value } = req.body;

    //현재 나의 order가 무엇인지 알아야한다.

    const currentTodo = await Todo.findById(todoId).exec();
    if (!currentTodo) {
        return res
            .status(404)
            .json({ errorMessage: '존재하지 않는 항목입니다.' });
    }

    if (order) {
        const targetTodo = await Todo.findOne({ order }).exec();
        if (targetTodo) {
            targetTodo.order = currentTodo.order;
            await targetTodo.save();
        }
        currentTodo.order = order;
    }

    if (done !== undefined) {
        currentTodo.doneAt = done ? new Date() : null;
    }

    if (value) {
        currentTodo.value = value;
    }

    await currentTodo.save();

    return res.status(200).json({});
});

router.delete('/todos/:todoId', async (req, res, next) => {
    const { todoId } = req.params;

    const todo = await Todo.findById(todoId).exec();
    if (!todo) {
        return res
            .status(404)
            .json({ errorMessage: '존재하지 않는 정보입니다.' });
    }

    await Todo.deleteOne({ _id: todoId });

    return res.status(200).json({});
});

export default router;
