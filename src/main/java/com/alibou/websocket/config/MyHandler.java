package com.alibou.websocket.config;

import com.alibou.websocket.chat.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;

import static com.alibou.websocket.chat.MessageType.JOIN;
import static com.alibou.websocket.chat.MessageType.LEAVE;

@Component
@Slf4j
public class MyHandler extends TextWebSocketHandler {
    private List<WebSocketSession> sessions = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // If not existing session add it.
        if (!sessions.contains(session)) {
            log.info("New Session Connected sessionId: {}", session.getId());
            sessions.add(session);

            /*
             *  The objective of following this approach here is instead of passing username
             *  actual Authorization token can be passed. During login the token can be further
             *  obtained from a controller. The implementation should be different for both opaque token
             *  and JWT.
             */
            String query = session.getUri().getQuery(); // extract username from query param
            String username = query.substring(9); // query will look something like this "username=some-username"

            session.getAttributes().put("username", username); // set the username in session

            ChatMessage chatMessage = ChatMessage.builder()
                    .sender(username)
                    .content(username + " has joined.")
                    .type(JOIN)
                    .build();

            String chatMessageAsJson = objectMapper.writeValueAsString(chatMessage);

            session.sendMessage(new TextMessage(chatMessageAsJson));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = (String) session.getAttributes().get("username");
        ChatMessage chatMessage = ChatMessage.builder()
                .sender(username)
                .content(username + " has left.")
                .type(LEAVE)
                .build();

        String chatMessageAsJson = objectMapper.writeValueAsString(chatMessage);

        session.sendMessage(new TextMessage(chatMessageAsJson));

        session.getAttributes().remove("username"); // unnecessary
        sessions.remove(session);
        log.info("Session has been closed sessionId: {}", session.getId());
    }
}
